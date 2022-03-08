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

	schema.setQuery(function($) {

		var arr = [];

		for (var item of MAIN.db.items) {
			if (item.kind === 'library') {
				if (!item.private || ($.user && ($.user.sa || ($.user.access && $.user.access.indexOf(item.id) !== -1))))
					arr.push(item);
			}
		}

		arr.quicksort('group');
		$.callback(arr);
	});

	schema.setRead(function($) {

		var item = MAIN.db.items.findItem('id', $.id);
		if (item && item.kind === 'library') {
			if (!item.private || ($.user && ($.user.sa || ($.user.access && $.user.access.indexOf(item.id) !== -1)))) {
				$.callback(item);
				return;
			}
		}

		$.invalid('@(Library not found)');
	});

	schema.setSave(function($, model) {

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
				if (item.libraryid === $.id || item.id === $.id) {
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

	});

	schema.addWorkflow('groups', function($) {

		var groups = {};

		for (var item of MAIN.db.items) {
			if (item.libraryid === $.id && item.kind === 'page' && item.group)
				groups[item.group] = 1;
		}

		var arr = [];
		for (var key in groups)
			arr.push({ id: key, name: key });

		$.callback(arr);
	});

	schema.addWorkflow('reindex', function($) {

		var arr = $.query.id.split(',');

		for (var item of MAIN.db.items) {
			if (item.kind === 'library') {
				var index = arr.indexOf(item.id);
				if (index !== -1)
					item.sortindex = index;
			}
		}

		FUNC.save();
		$.success();
	});

});
