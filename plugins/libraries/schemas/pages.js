NEWSCHEMA('Pages', function(schema) {

	schema.define('id', UID);
	schema.define('libraryid', UID, true);
	schema.define('group', String);
	schema.define('name', String, true);
	schema.define('title', String);
	schema.define('icon', String);
	schema.define('color', 'Color');
	schema.define('version', String);
	schema.define('newbie', Boolean);
	schema.define('deprecated', Boolean);
	schema.define('welcome', Boolean);
	schema.define('sortindex', Number);

	schema.action('list', {
		name: 'List of pages',
		action: function($) {

			var params = $.params;
			var db = MAIN.db;

			if (MAIN.private[params.libraryid]) {
				if (!$.user || (!$.user.sa && (!$.user.permissions || $.user.permissions.includes(params.libraryid)))) {
					$.callback([]);
					return;
				}
			}

			var arr = [];

			for (var item of db.items) {
				if (item.kind === 'page' && item.libraryid === params.libraryid)
					arr.push(item);
			}

			$.callback(arr);
		}
	});

	schema.action('query', {
		name: 'Pages query',
		query: 'library:UID',
		action: function($) {
			var id = $.query.library;

			if (MAIN.private[id]) {
				if (!$.user || (!$.user.sa && (!$.user.permissions || $.user.permissions.indexOf(id) === -1))) {
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
		}
	});

	schema.action('read', {
		name: 'Read pages',
		params: '*id:UID',
		action: function($) {
			var params = $.params;
			var item = MAIN.db.items.findItem('id', params.id);
			if (item && item.kind === 'page') {
				item = CLONE(item);
				var library = MAIN.db.items.findItem('id', item.libraryid);
				item.welcome = library ? library.pageid === item.id : false;
				$.callback(item);
			} else
				$.invalid(404);
		}
	});

	schema.action('save', {
		name: 'Save page',
		action: function($, model) {

			if (!$.user.sa && $.user.permissions.indexOf(model.libraryid) === -1) {
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
				MAIN.db.items.push(model);
				FUNC.save();
				$.success(model.id);
			}

			if (welcome) {
				item = MAIN.db.items.findItem('id', model.libraryid);
				if (item && item.kind === 'library')
					item.pageid = model.id;
			}
		}
	});

	schema.action('remove', {
		name: 'Remove page',
		params: '*id:UID',
		action: function($) {
			var params = $.params;

			if (!$.user.sa) {
				$.invalid(401);
				return;
			}

			var index = 0;
			var count = 0;

			while (true) {
				var item = MAIN.db.items[index];
				if (item) {
					if ((item.kind === 'page' && item.id === params.id) || (item.kind === 'item' && item.pageid && item.pageid.indexOf($.id) !== -1)) {
						if ($.user.sa || $.user.permissions.indexOf(item.libraryid) !== -1) {
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
		}
	});

	schema.action('reindex', {
		name: 'Reindex pages',
		query: 'id:String',
		action: function($) {
			var query = $.query;
			var arr = query.id.split(',');
			for (var item of MAIN.db.items) {
				if (item.kind === 'page') {
					var index = arr.indexOf(item.id);
					if (index !== -1)
						item.sortindex = index;
				}
			}

			FUNC.save();
			$.success();
		}
	});

	schema.action('clone', {
		name: 'Clone pages',
		params: '*id:UID',
		action: function($) {
			var params = $.params;
			var db = NOSQL('db');

			db.one().id(params.id).callback(function(err, response) {

				if (response) {

					var insert = [];

					response.id = UID();
					response.dtcreated = NOW;
					response.name += ' cloned';
					delete response.updater;
					delete response.dtupdated;

					insert.push(response);

					db.find().where('pageid', params.id).callback(function(err, items) {

						for (var item of items) {
							item.id = UID();
							var index = item.pageid.indexOf(params.id);
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
		}
	});

});