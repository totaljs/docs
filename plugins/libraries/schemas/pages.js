NEWSCHEMA('@Page', 'id:UID,*libraryid:UID,group,*name,title,icon:Icon,color:Color,version,newbie:Boolean,deprecated:Boolean,welcome:Boolean,sortindex:Number');

NEWACTION('Pages/list', {
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

NEWACTION('Pages/query', {
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

NEWACTION('Pages/read', {
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

NEWACTION('Pages/save', {
	name: 'Save page',
	input: '@Page',
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

NEWACTION('Pages/remove', {
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

NEWACTION('Pages/reindex', {
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

NEWACTION('Pages/clone', {
	name: 'Clone pages',
	params: '*id:UID',
	action: function($) {
		var params = $.params;
		$.invalid(501);
	}
});