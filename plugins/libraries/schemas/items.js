NEWSCHEMA('@Item', 'id:UID,pageid:[UID],libraryid:UID,type:{text|property|delegate|method|event|command|rest|faq|help|glossary},icon:Icon,color:Color,version,keywords,newbie:Boolean,bottom:Boolean,deprecated:Boolean,changelog,*name,note,body');

function unauthorized($, id) {

	if (!$.user)
		return true;

	if ($.user.sa)
		return false;

	if ($.user.permissions.includes('admin'))
		return false;

	if (id && $.user.permissions.includes(id))
		return false;

	return true;
}

NEWACTION('Items/query', {
	name: 'Items query',
	query: '*library:UID,*page:UID,q:String',
	action: function($) {

		var query = $.query;

		if (MAIN.private[query.library]) {
			if (unauthorized($, query.library)) {
				$.callback([]);
				return;
			}
		}

		var arr = [];
		var q = query.q ? query.q.toSearch() : '';

		for (var item of MAIN.db.items) {

			if (item.libraryid !== query.library)
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
				if (item.kind !== 'item' || !(item.pageid instanceof Array) || item.pageid.indexOf(query.page) === -1)
					continue;
				arr.push(item);
			}
		}

		arr.quicksort('name');
		$.callback(arr);
	}
});

NEWACTION('Items/read', {
	name: 'Read item',
	params: '*id:UID',
	action: function($) {
		var params = $.params;
		var item = MAIN.db.items.findItem('id', params.id);
		if (item && item.kind === 'item')
			$.callback(item);
		else
			$.invalid(404);
	}
});

NEWACTION('Items/save', {
	name: 'Save item',
	input: '@Item',
	user: true,
	action: function($, model) {

		if (unauthorized($, model.libraryid)) {
			$.invalid(401);
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
	}
});

NEWACTION('Items/remove', {
	name: 'Remove item',
	params: '*id:UID',
	user: true,
	action: function($) {
		var params = $.params;
		var index = MAIN.db.items.findIndex('id', params.id);
		var item = MAIN.db.items[index];
		if (item && item.kind === 'item') {

			if (unauthorized($, item.libraryid)) {
				$.invalid(401);
				return;
			}

			MAIN.db.items.splice(index, 1);
			FUNC.save();
			$.success();
		} else
			$.invalid(404);
	}
});

NEWACTION('Items/search', {
	name: 'Search item',
	query: '*library:UID,q:String',
	action: function($) {

		var query = $.query;

		if (MAIN.private[query.library]) {
			if (unauthorized($, query.library)) {
				$.callback([]);
				return;
			}
		}

		var arr = [];
		var q = query.q ? query.q.toSearch() : '';

		for (var item of MAIN.db.items) {

			if (item.libraryid !== query.library)
				continue;

			if (item.kind === 'page' || item.kind === 'item') {

				if (q && item.search.indexOf(q) === -1)
					continue;

				arr.push({ id: item.id, pageid: item.pageid, name: item.name, type: item.type, icon: item.icon, color: item.color, kind: item.kind });

				if (arr.length > 50)
					break;
			}
		}

		arr.quicksort('name');
		$.callback(arr);
	}
});