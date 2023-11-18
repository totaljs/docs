NEWSCHEMA('@Library', 'id:UID,*name,group,*linker,icon:Icon,color:Color,newbie:Boolean,groups:[String],private:Boolean');

NEWACTION('Libraries/list', {
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

NEWACTION('Libraries/read', {
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

NEWACTION('Libraries/save', {
	name: 'Save library',
	input: '@Library',
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

NEWACTION('Libraries/remove', {
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

NEWACTION('Libraries/groups', {
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

NEWACTION('Libraries/clone', {
	name: 'Clone library',
	params: '*id',
	action: function($) {

		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);

		if (!item || item.kind !== 'library') {
			$.invalid(404);
			return;
		}

		item = CLONE(item);
		item.id = UID();
		item.dtcreated = NOW;
		item.dtupdated = NOW;
		item.name += ' (CLONED)';
		item.linker = item.linker + '-cloned';

		MAIN.db.items.push(item);

		var pages = {};

		for (let doc of MAIN.db.items) {
			if (doc.libraryid !== params.id || doc.kind !== 'page')
				continue;
			let sub = CLONE(doc);
			pages[sub.id] = UID();
			sub.id = pages[sub.id];
			sub.libraryid = item.id;
			MAIN.db.items.push(sub);
		}

		for (let doc of MAIN.db.items) {

			if (doc.libraryid !== params.id || doc.kind !== 'item')
				continue;

			let sub = CLONE(doc);

			if (typeof(sub.pageid) === 'string')
				sub.pageid = [sub.pageid];

			for (let i = 0; i < sub.pageid.length; i++) {
				if (pages[sub.pageid[i]])
					sub.pageid[i] = pages[sub.pageid[i]];
			}

			sub.id = UID();
			sub.libraryid = item.id;

			sub.body = sub.body.replaceAll(params.id, item.id);

			for (let key in pages)
				sub.body = sub.body.replaceAll(key, pages[key]);

			MAIN.db.items.push(sub);
		}

		if (typeof(item.pageid) === 'string')
			item.pageid = pages[item.pageid] || null;

		FUNC.refresh();
		FUNC.save();
		$.success(item.id);
	}
});

NEWACTION('Libraries/reindex', {
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

NEWACTION('Libraries/db', {
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