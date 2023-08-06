exports.install = function() {

	// Routing
	ROUTE('GET        /                 ', view_index);
	ROUTE('GET        /{library}/       ', view_index);
	ROUTE('GET        /{library}/{page}/', view_index);

	ROUTE('+GET       /api/clean/',        clean);
	ROUTE('+GET       /api/files/',        files_browse);
	ROUTE('+POST      /api/upload/',       upload, ['upload'], 1024 * 10);
	ROUTE('+GET       /backup/',           backup, [1000 * 60]);
	ROUTE('+POST      /restore/',          restore, ['upload', 1000 * 60], 1024 * 100); // Max. 100 MB

	// Settings
	ROUTE('+API    /api/    -settings             *Settings   --> read');
	ROUTE('+API    /api/    +settings_save        *Settings   --> save');
	ROUTE('+API    /api/    -settings_groups      *Settings   --> groups');

	ROUTE('FILE /download/*.*', files);
};

function view_index() {
	var self = this;

	var plugins = [];
	var language = (self.user ? self.user.language || '' : '');

	for (var key in F.plugins) {
		var item = F.plugins[key];
		var obj = {};
		obj.id = item.id;
		obj.routes = item.routes;
		obj.position = item.position;
		obj.name = TRANSLATOR(language, item.name);
		obj.icon = item.icon;
		obj.import = item.import ? '/_{id}/{import}'.args(item) : '';
		obj.hidden = item.hidden;
		plugins.push(obj);
	}

	plugins.quicksort('position');

	if (self.url === '/' && self.query.url && ((/^http(s)?:\/\/[a-z0-9]+/).test(self.query.url))) {
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
		if (MAIN.db.config.secured && !self.user)
			self.throw401();
		else
			self.view('index', plugins);
	}
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

	if (!file.extension) {
		file.extension = 'dat';
		file.filename += '.dat';
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

async function clean() {

	var self = this;

	if (!self.user.sa) {
		self.invalid(401);
		return;
	}

	var files = await MAIN.fs.browse2();
	var cache = {};

	for (var item of MAIN.db.items) {
		if (item.body) {
			var m = item.body.match(/\/download\/.*?\.\w{1,8}/g);
			if (m) {
				for (var i = 0; i < m.length; i++)
					cache[m[i].substring(10).split('-')[0]] = 1;
			}
		}
	}

	var rem = [];

	for (var file of files) {

		if (file.id === 'meta')
			continue;

		if (!cache[file.id])
			rem.push(file.id);
	}

	rem.wait(function(id, next) {
		MAIN.fs.remove(id, next);
	});

	self.success(true, rem.length);
}

async function files_browse() {

	var files = await MAIN.fs.browse2();
	var index = files.findIndex('id', 'meta');
	files.splice(index, 1);

	for (var file of files)
		file.url = '/download/' + file.id + '-' + file.id.makeid() + '-' + (file.width || 0) + 'x' + (file.height || 0) + '-1.' + file.ext;

	this.json(files);
}