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

		var arr = [];

		for (var item of MAIN.db.items) {
			if (item.kind === 'page' && item.libraryid === id)
				arr.push(item);
		}

		$.callback(arr);
	});

	schema.setRead(function($) {
		var item = MAIN.db.items.findItem('id', $.id);
		if (item && item.kind === 'page')
			$.callback(item);
		else
			$.invalid(404);
	});

	schema.setSave(function($, model) {

		if (!$.user.sa && $.user.libraries.indexOf(model.libraryid) === -1) {
			$.invalid(401);
			return;
		}

		var welcome = model.welcome;
		var item;

		model.dtupdated = NOW;
		model.linker = model.name.slug();
		model.search = model.name.toSearch();

		delete model.welcome;

		if (model.id) {
			item = MAIN.db.items.findItem('id', model.id);
			if (item && item.kind === 'page') {
				model.updater = $.user.name;
				COPY(model, item);
				FUNC.save();
				$.success(model.id);
			} else {
				$.invalid(404);
				return;
			}

		} else {
			model.id = UID();
			model.kind = 'page';
			model.creator = $.user.name;
			model.dtcreated = NOW;
			model.sortindex = Date.now() - TS;
			MAIN.db.items.push(model);
			FUNC.save();
			$.success(model.id);
		}

		if (welcome) {
			item = MAIN.db.items.findItem('id', model.libraryid);
			if (item && item.kind === 'library')
				item.pageid = model.id;
		}

	});

	schema.setRemove(function($) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		var index = 0;
		var count = 0;

		while (true) {
			var item = MAIN.db.items[index];
			if (item) {
				if ((item.kind === 'page' && item.id === $.id) || (item.kind === 'item' && item.pageid && item.pageid.indexOf($.id) !== -1)) {
					if ($.user.sa || $.user.libraries.indexOf(item.libraryid) !== -1) {
						count++;
						MAIN.db.items.splice(index, 1);
					} else
						index++;
				} else
					index++;
			} else
				break;
		}

		count && FUNC.save();
		$.success();

	});

	schema.addWorkflow('reindex', function($) {
		var arr = $.query.id.split(',');
		for (var item of MAIN.db.items) {
			if (item.kind === 'page') {
				var index = arr.indexOf(item.id);
				if (index !== -1)
					item.sortindex = index;
			}
		}

		FUNC.save();
		$.success();
	});

	schema.addWorkflow('clone', function($) {

		var id = $.id;
		var db = NOSQL('db');

		db.one().id(id).callback(function(err, response) {

			if (response) {

				var insert = [];

				response.id = UID();
				response.dtcreated = NOW;
				response.name += ' cloned';
				delete response.updater;
				delete response.dtupdated;

				insert.push(response);

				db.find().where('pageid', id).callback(function(err, items) {

					for (var item of items) {
						item.id = UID();
						var index = item.pageid.indexOf(id);
						if (index !== -1) {
							item.pageid[index] = response.id;
							item.dtcreated = NOW;
							delete item.dtupdated;
							delete item.updater;
							insert.push(item);
						}
					}

					for (var item of insert)
						db.insert(item);

					setTimeout($.done(), 1500);

				});

			} else
				$.invalid(404);

		});

	});

});