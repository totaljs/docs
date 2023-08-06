NEWSCHEMA('Libraries', function(schema) {

	schema.define('id', UID);
	schema.define('name', 'String(50)', true);
	schema.define('group', 'String(50)');
	schema.define('linker', 'String(50)', true);
	schema.define('icon', 'String(30)');
	schema.define('color', 'String(7)');
	schema.define('newbie', Boolean);
	schema.define('groups', '[String]');
	schema.define('private', Boolean);

	schema.action('list', {
		name: 'List of libraries',
		action: function($) {

			var db = MAIN.db;
			var arr = [];

			for (var item of db.items) {
				if (item.kind === 'library') {
					if (!item.private || ($.user && ($.user.sa || ($.user.permissions && $.user.permissions.includes(item.id)))))
						arr.push(item);
				}
			}

			arr.quicksort('group');
			$.callback(arr);

		}
	});

	schema.action('read', {
		name: 'Read library',
		params: '*id:UID',
		action: function($) {

			var params = $.params;
			var db = MAIN.db;

			var item = db.items.findItem('id', params.id);
			if (item && item.kind === 'library') {
				if (!item.private || ($.user && ($.user.sa || ($.user.permissions && $.user.permissions.includes(item.id))))) {
					$.callback(item);
					return;
				}
			}

			$.invalid('@(Library not found)');
		}
	});

	schema.action('save', {
		name: 'Save library',
		action: async function($, model) {

			if (!$.user.sa) {
				$.invalid(401);
				return;
			}

			model.dtupdated = NOW;

			if (model.id) {
				var item = MAIN.db.items.findItem('id', model.id);
				if (item && item.kind === 'library') {
					item.updater = $.user.name;
					COPY(model, item);
					FUNC.save();
					FUNC.refresh();
					$.success(model.linker);
				} else
					$.invalid(404);
			} else {
				model.kind = 'library';
				model.id = UID();
				model.dtcreated = NOW;
				model.creator = $.user.name;
				MAIN.db.items.push(model);
				FUNC.save();
				FUNC.refresh();
				$.success(model.linker);
			}
		}
	});

	schema.action('remove', {
		name: 'Remove library',
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
					if (item.libraryid === params.id || item.id === params.id) {
						count++;
						MAIN.db.items.splice(index, 1);
					} else
						index++;
				} else
					break;
			}

			if (count) {
				FUNC.refresh();
				FUNC.save();
			}

			$.success();
		}
	});

	schema.action('groups', {
		name: 'Libraries groups',
		params: '*id:UID',
		action: function($) {

			var params = $.params;
			var library = MAIN.db.items.findItem('id', params.id);
			var groups = library ? library.groups : null;

			var arr = [];

			if (groups) {
				for (var key of groups)
					arr.push({ id: key, name: key });
			}

			$.callback(arr);
		}
	});

	schema.action('reindex', {
		name: 'Reindex library',
		query: 'id:String',
		action: function($) {

			var query = $.query;
			var arr = query.id.split(',');

			for (var item of MAIN.db.items) {
				if (item.kind === 'library') {
					var index = arr.indexOf(item.id);
					if (index !== -1)
						item.sortindex = index;
				}
			}

			FUNC.save();
			$.success();
		}
	});

	schema.action('db', {
		query: '*library',
		action: function($) {

			var arr = [];
			var pages = {};
			var linker = $.query.library;
			var libraryid = null;

			for (var item of MAIN.db.items) {
				if (item.kind === 'library' && item.linker === linker) {
					libraryid = item.id;
					break;
				}
			}

			if (!libraryid) {
				$.callback([]);
				return;
			}

			if (MAIN.private[libraryid]) {
				if (!$.user || (!$.user.sa && (!$.user.permissions || $.user.permissions.indexOf(libraryid) === -1))) {
					$.callback([]);
					return;
				}
			}

			for (var item of MAIN.db.items) {

				if (libraryid !== item.id && libraryid !== item.libraryid)
					continue;

				if (item.kind === 'page') {
					pages[item.id] = item.name;
					continue;
				}

				if (item.kind === 'item')
					arr.push({ id: item.id, page: '', pageid: item.pageid[0], name: item.name, type: item.type, icon: item.icon, color: item.color, changelog: item.changelog, note: item.note, body: item.body, newbie: item.newbie, deprecated: item.deprecated, dtcreated: item.dtcreated, dtupdated: item.dtupdated });
			}

			for (var item of arr) {
				if (item.pageid)
					item.page = pages[item.pageid];
			}

			arr.quicksort('page');
			$.callback(arr);
		}
	});

});
