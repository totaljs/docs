NEWSCHEMA('Items', function(schema) {

	schema.define('id', UID);
	schema.define('pageid', '[UID]', true);
	schema.define('libraryid', UID, true);
	schema.define('type', ['text', 'property', 'delegate', 'method', 'event', 'command', 'rest', 'faq', 'help', 'glossary'], true);
	schema.define('icon', 'String(30)');
	schema.define('color', 'String(7)');
	schema.define('version', 'String(20)');
	schema.define('keywords', String);
	schema.define('newbie', Boolean);
	schema.define('bottom', Boolean);
	schema.define('deprecated', Boolean);
	schema.define('changelog', String);
	schema.define('name', String, true);
	schema.define('note', String);
	schema.define('body', String);

	schema.setQuery(function($) {

		var builder = NOSQL('db').find();
		builder.where('kind', 'item');
		builder.where('libraryid', $.query.library);

		if ($.query.q) {
			builder.search('search', $.query.q.toSearch());
			builder.where('type', '<>', 'text');
			builder.fields('id,pageid,name,type,icon,color');
			builder.take(50);
		} else
			builder.in('pageid', [$.query.page]);

		builder.sort('name_asc');
		builder.callback($.callback);
	});

	schema.setRead(function($) {
		NOSQL('db').read().where('kind', 'item').id($.id).callback($.callback, 'error-items-404');
	});

	schema.setSave(function($, model) {

		if (!$.user.sa && $.user.libraries.indexOf(model.libraryid) === -1) {
			$.invalid('error-permissions');
			return;
		}

		model.search = (model.name + ' ' + model.keywords).toSearch();

		var db = NOSQL('db');
		if (model.id) {
			model.updater = $.user.name;
			model.dtupdated = NOW;
			db.modify(model).id(model.id).callback($.done(model.id));
		} else {
			model.kind = 'item';
			model.id = UID16();
			model.creator = $.user.name;
			model.dtcreated = NOW;
			db.insert(model).callback($.done(model.id));
		}
	});

	schema.setRemove(function($) {

		var builder = NOSQL('db').remove();

		if (!$.user.sa)
			builder.in('libraryid', $.user.libraries);

		builder.where('kind', 'item');
		builder.id($.id);
		builder.callback($.done(), 'error-items-404');
	});

});