exports.install = function() {

	// Routing
	ROUTE('GET        /                                          ', view_index);
	ROUTE('GET        /{library}/                                ', 'index');
	ROUTE('GET        /{library}/{page}/                         ', 'index');

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

	// Profile
	ROUTE('+GET       /api/profile/                  *Profile     --> read');
	ROUTE('+POST      /api/profile/                  *Profile     --> save');
	ROUTE('POST       /api/login/                    *Login       --> exec');
	ROUTE('POST       /api/request/                  *Request     --> exec');

	ROUTE('+POST     /api/upload/', upload, ['upload'], 1024 * 10);
	ROUTE('GET       /logoff/', logoff);

	ROUTE('FILE /download/*.*', files);
	ROUTE('FILE /openplatform.json', openplatform);

};

function view_index() {
	var self = this;
	if (self.query.url && ((/^http(s)?:\/\/[a-z0-9]+/).test(self.query.url))) {
		NOSQL('external').insert({ id: UID(), url: self.query.url, ip: self.ip, ua: self.ua, dtcreated: NOW });
		var opt = {};
		opt.method = 'GET';
		opt.url = self.query.url;
		opt.dnscache = true;
		opt.limit = 100;
		opt.callback = function(err, response) {
			if (err)
				self.json(err);
			else
				self.view('external', response.body);
		};
		REQUEST(opt);
	} else
		self.view('index');
}

function openplatform(req, res) {
	res.file(PATH.root('openplatform.json'));
}

function files(req, res) {
	var arr = req.split[1].split('-');
	var id = arr[0];
	var hash = arr[0].makeid();
	if (arr[1] === hash)
		res.filefs('files', id);
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