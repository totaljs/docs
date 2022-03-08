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

		var id = $.query.library;

		if (MAIN.private[id]) {
			if (!$.user || (!$.user.sa && (!$.user.access || $.user.access.indexOf(id) === -1))) {
				$.callback([]);
				return;
			}
		}

		var arr = [];
		var q = $.query.q ? $.query.q.toSearch() : '';

		for (var item of MAIN.db.items) {

			if (item.libraryid !== id)
				continue;

			if (q) {

				if (item.kind === 'page' || item.kind === 'item') {
					if (item.search.indexOf(q) === -1)
						continue;
					arr.push({ id: item.id, pageid: item.pageid, name: item.name, type: item.type, icon: item.icon, color: item.color, kind: item.kind });
					if (arr.length > 50)
						break;
				}

			} else {
				if (item.kind !== 'item' || !(item.pageid instanceof Array) || item.pageid.indexOf($.query.page) === -1)
					continue;
				arr.push(item);
			}
		}

		arr.quicksort('name');
		$.callback(arr);

	});

	schema.setRead(function($) {

		var item = MAIN.db.items.findItem('id', $.id);
		if (item && item.kind === 'item')
			$.callback(item);
		else
			$.invalid(404);

	});

	schema.setSave(function($, model) {

		if (!$.user.sa && $.user.libraries.indexOf(model.libraryid) === -1) {
			$.invalid('@(Invalid permissions)');
			return;
		}

		model.search = (model.name + ' ' + model.keywords).toSearch();
		model.dtupdated = NOW;
		delete model.keywords;

		if (model.id) {
			var item = MAIN.db.items.findItem('id', model.id);
			if (item) {
				item.updater = $.user.name;
				COPY(model, item);
				FUNC.save();
				$.success(model.id);
			} else
				$.invalid(404);
		} else {
			model.id = UID();
			model.kind = 'item';
			model.creator = $.user.name;
			model.dtcreated = NOW;
			MAIN.db.items.push(model);
			FUNC.save();
			$.success(model.id);
		}
	});

	schema.setRemove(function($) {
		var index = MAIN.db.items.findIndex('id', $.id);
		var item = MAIN.db.items[index];
		if (item && item.kind === 'item' && ($.user.sa || $.user.libraries.indexOf(item.libraryid) !== -1)) {
			MAIN.db.items.splice(index, 1);
			FUNC.save();
			$.success();
		} else
			$.invalid(404);
	});

});