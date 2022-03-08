MAIN.version = 1;
MAIN.session = SESSION();
MAIN.fs = FILESTORAGE('files');
MAIN.db = { items: [] };

MAIN.session.ondata = function(meta, next) {
	NOSQL('users').read().fields('-password').where('isdisabled', false).id(meta.id).callback(next);
};

AUTH(function($) {
	var opt = {};
	opt.name = CONF.admin_cookie;
	opt.key = CONF.admin_secret;
	opt.expire = '1 month';
	MAIN.session.getcookie($, opt, $.done());
});

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
		EXEC('-Settings --> load', NOOP);
		callback && callback();
	});
};

FUNC.refresh = function() {
	MAIN.private = {};
	for (var item of MAIN.db.items) {
		if (item.private && item.kind === 'library')
			MAIN.private[item.id] = 1;
	}
};

FUNC.load();