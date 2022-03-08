exports.install = function() {

	// Routing
	ROUTE('GET        /                                          ', view_index);
	ROUTE('GET        /{library}/                                ', view_index);
	ROUTE('GET        /{library}/{page}/                         ', view_index);

	// Libraries
	ROUTE('GET        /api/libraries/                *Libraries   --> query');
	ROUTE('GET        /api/libraries/{id}/           *Libraries   --> read');
	ROUTE('+POST      /api/libraries/                *Libraries   --> save');
	ROUTE('+DELETE    /api/libraries/{id}/           *Libraries   --> remove');
	ROUTE('+GET       /api/libraries/{id}/groups/    *Libraries   --> groups');
	ROUTE('+GET       /api/libraries/reindex/        *Libraries   --> reindex');

	// Pages
	ROUTE('GET        /api/pages/                    *Pages       --> query');
	ROUTE('GET        /api/pages/{id}/               *Pages       --> read');
	ROUTE('+GET       /api/pages/{id}/clone/         *Pages       --> clone', [10000]);
	ROUTE('+POST      /api/pages/                    *Pages       --> save');
	ROUTE('+DELETE    /api/pages/{id}/               *Pages       --> remove');
	ROUTE('+GET       /api/pages/reindex/            *Pages       --> reindex');

	// Items
	ROUTE('GET        /api/items/                    *Items       --> query');
	ROUTE('GET        /api/items/{id}/               *Items       --> read');
	ROUTE('+POST      /api/items/                    *Items       --> save');
	ROUTE('+DELETE    /api/items/{id}/               *Items       --> remove');

	// Users
	ROUTE('+GET       /api/users/                    *Users       --> query');
	ROUTE('+GET       /api/users/{id}/               *Users       --> read');
	ROUTE('+POST      /api/users/                    *Users       --> insert');
	ROUTE('+POST      /api/users/{id}/               *Users       --> update');
	ROUTE('+DELETE    /api/users/{id}/               *Users       --> remove');

	// Settings
	ROUTE('+GET       /api/settings/                 *Settings    --> read');
	ROUTE('+POST      /api/settings/                 *Settings    --> save');
	ROUTE('+GET       /api/settings/groups/          *Settings    --> groups');

	// Profile
	ROUTE('+GET       /api/profile/                  *Profile     --> read');
	ROUTE('+POST      /api/profile/                  *Profile     --> save');
	ROUTE('POST       /api/login/                    *Login       --> exec');
	ROUTE('POST       /api/request/                  *Request     --> exec');
	ROUTE('POST       /api/password/                 *Password    --> exec');

	ROUTE('+POST     /api/upload/',  upload,  ['upload'], 1024 * 10);
	ROUTE('GET       /logoff/',      logoff);

	ROUTE('+GET      /backup/',      backup,  [1000 * 60]);
	ROUTE('+POST     /restore/',     restore, ['upload', 1000 * 60], 1024 * 100); // Max. 100 MB

	ROUTE('FILE /download/*.*', files);
};

function view_index() {
	var self = this;
	if (self.url === '/' && self.query.url && ((/^http(s)?:\/\/[a-z0-9]+/).test(self.query.url))) {
		NOSQL('external').insert({ id: UID(), url: self.query.url, ip: self.ip, ua: self.ua, dtcreated: NOW });
		var opt = {};
		opt.method = 'GET';
		opt.url = self.query.url;
		opt.dnscache = true;
		opt.limit = 100;
		opt.timeout = 3000;
		opt.callback = function(err, response) {
			if (err)
				self.json(err);
			else
				self.view('external', response.body);
		};
		REQUEST(opt);
	} else {

		if (PREF.settings && PREF.settings.password) {

			if (BLOCKED(self, 10))
				return;

			if (self.cookie(CONF.password_cookie) !== CONF.contentpassword) {
				self.view('login');
				return;
			}

			BLOCKED(self, -1);
		}

		self.view('index');
	}
}

function openplatform(req, res) {
	res.file(PATH.root('openplatform.json'));
}

const isIMAGE = { jpg: 1, png: 1, gif: 1, svg: 1 };

function files(req, res) {
	var arr = req.split[1].split('-');
	var id = arr[0];
	var hash = arr[0].makeid();
	if (arr[1] === hash)
		res.filefs('files', id, !isIMAGE[req.extension]);
	else
		res.throw404();
}

function upload() {

	var self = this;
	var file = self.files[0];

	if (!file) {
		self.json(null);
		return;
	}

	var id = UID();

	FILESTORAGE('files').save(id, file.filename, file.stream(), function(err, meta) {

		if (err) {
			self.invalid('error-filetype', err + '');
			return;
		}

		var w = meta.width || 0;
		var h = meta.height || 0;

		meta.url = '/download/' + id + '-' + id.makeid() + '-' + w + 'x' + h + '-1.' + file.extension;
		self.json(meta);
	});
}

function logoff() {
	var self = this;

	if (self.user) {
		MAIN.session.remove(self.sessionid);
		self.cookie(CONF.admin_cookie, '', '-1 day');
	}

	self.redirect('/');
}

function backup() {

	var $ = this;

	if (!$.user.sa) {
		$.invalid(401);
		return;
	}

	var filename = CONF.name.slug() + '-{0}.txt'.format(NOW.format('yyyy-MM-dd'));

	MAIN.fs.backup(PATH.temp(filename), function(err, meta) {
		if (meta)
			$.file('~' + meta.filename, filename);
		else
			$.invalid(err);
	});
}

function restore() {
	var $ = this;

	if (!$.user.sa) {
		$.invalid(401);
		return;
	}

	MAIN.fs.restore($.files[0].path, function(err, meta) {
		if (meta && meta.files)
			FUNC.load($.done());
		else
			$.success();
	});
}