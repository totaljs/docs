MAIN.version = 1;
MAIN.fs = FILESTORAGE('files');
MAIN.db = { items: [] };

function save() {
	MAIN.db.version = MAIN.version;
	MAIN.db.dtupdated = NOW;
	MAIN.fs.savejson('meta', MAIN.db, NOOP);
}

FUNC.save = function() {
	setTimeout2('FUNC.save', save, 5000);
};

FUNC.load = function(callback) {
	MAIN.fs.readjson('meta', function(err, response) {
		if (!response)
			response = { items: [], config: { groups: [] }};
		MAIN.db = response;
		FUNC.refresh();
		EXEC('Settings/load').callback(ERROR('Settings/Load'));
		callback && callback();
	});
};

FUNC.refresh = function() {
	MAIN.private = {};

	OpenPlatform.permissions = [{ id: 'admin', name: 'Admin' }];

	for (var item of MAIN.db.items) {

		if (item.kind === 'library')
			OpenPlatform.permissions.push({ id: item.id, name: item.name });

		if (item.private && item.kind === 'library')
			MAIN.private[item.id] = 1;
	}

};

FUNC.load();