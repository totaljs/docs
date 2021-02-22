NEWSCHEMA('Libraries', function(schema) {

	schema.define('id', UID);
	schema.define('name', 'String(50)', true);
	schema.define('group', 'String(50)');
	schema.define('linker', 'String(50)', true);
	schema.define('icon', 'String(30)');
	schema.define('color', 'String(7)');
	schema.define('newbie', Boolean);
	schema.define('groups', '[String]');

	schema.setQuery(function($) {
		NOSQL('db').find().where('kind', 'library').sort('group').callback($.callback);
	});

	schema.setRead(function($) {
		NOSQL('db').read().where('kind', 'library').id($.id).callback($.callback, 'error-libraries-404');
	});

	schema.setSave(function($, model) {

		if (!$.user.sa) {
			$.invalid('error-permissions');
			return;
		}

		var db = NOSQL('db');

		model.dtupdated = NOW;

		if (model.id) {
			model.updater = $.user.name;
			db.modify(model).id(model.id).callback($.done());
		} else {
			model.kind = 'library';
			model.id = UID16();
			model.dtcreated = NOW;
			model.creator = $.user.name;
			db.insert(model).callback($.done());
		}
	});

	schema.setRemove(function($) {

		if (!$.user.sa) {
			$.invalid('error-permissions');
			return;
		}

		NOSQL('db').remove().or(function(builder) {
			builder.where('libraryid', $.id);
			builder.id($.id);
		}).callback($.done());

	});

	schema.addWorkflow('groups', function($) {
		NOSQL('db').scalar('group', 'group').where('libraryid', $.id).where('kind', 'page').contains('group').callback(function(err, response) {
			var keys = Object.keys(response);
			var arr = [];
			for (var i = 0; i < keys.length; i++)
				arr.push({ id: keys[i], name: keys[i] });
			$.callback(arr);
		});
	});

	schema.addWorkflow('reindex', function($) {
		var arr = $.query.id.split(',');
		var db = NOSQL('db');
		for (var i = 0; i < arr.length; i++)
			db.modify({ sortindex: i }).where('id', arr[i]).where('kind', 'library');
		$.success();
	});

});