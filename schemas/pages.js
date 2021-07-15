const TS = (new Date(2020, 7, 1)).getTime();

NEWSCHEMA('Pages', function(schema) {

	schema.define('id', UID);
	schema.define('libraryid', UID, true);
	schema.define('group', 'String(50)');
	schema.define('name', 'String(50)', true);
	schema.define('icon', 'String(30)');
	schema.define('color', 'String(7)');
	schema.define('version', 'String(20)');
	schema.define('newbie', Boolean);
	schema.define('deprecated', Boolean);
	schema.define('welcome', Boolean);
	schema.define('sortindex', Number);

	schema.setQuery(function($) {

		var id = $.query.library;
		if (MAIN.private[id]) {
			if (!$.user || (!$.user.sa && (!$.user.access || $.user.access.indexOf(id) === -1))) {
				$.callback([]);
				return;
			}
		}

		NOSQL('db').find().where('kind', 'page').where('libraryid', id).callback($.callback);
	});

	schema.setRead(function($) {
		NOSQL('db').read().where('kind', 'page').id($.id).callback($.callback, 'error-pages-404');
	});

	schema.setSave(function($, model) {

		if (!$.user.sa && $.user.libraries.indexOf(model.libraryid) === -1) {
			$.invalid('error-permissions');
			return;
		}

		var db = NOSQL('db');
		var welcome = model.welcome;

		model.dtupdated = NOW;
		model.linker = model.name.slug();
		model.search = model.name.toSearch();

		delete model.welcome;

		if (model.id) {
			model.updater = $.user.name;
			db.modify(model).id(model.id).callback($.done(model.id));
		} else {
			model.id = UID16();
			model.kind = 'page';
			model.creator = $.user.name;
			model.dtcreated = NOW;
			model.sortindex = Date.now() - TS;
			db.insert(model).callback($.done(model.id));
		}

		welcome && NOSQL('db').modify({ pageid: model.id }).id(model.libraryid).where('kind', 'library');
	});

	schema.setRemove(function($) {
		var builder = NOSQL('db').remove();

		if (!$.user.sa)
			builder.in('libraryid', $.user.libraries);

		builder.in('kind', ['page', 'item']);
		builder.or(function(builder) {
			builder.where('pageid', $.id);
			builder.id($.id);
		}).callback($.done());
	});

	schema.addWorkflow('reindex', function($) {
		var arr = $.query.id.split(',');
		var db = NOSQL('db');
		for (var i = 0; i < arr.length; i++)
			db.modify({ sortindex: i }).where('id', arr[i]).where('kind', 'page');
		$.success();
	});

});