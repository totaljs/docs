exports.install = function() {

	// Routing
	ROUTE('GET        /                 ', view_index);
	ROUTE('GET        /{library}/       ', view_index);
	ROUTE('GET        /{library}/{page}/', view_index);

	ROUTE('+GET       /api/clean/',        clean);
	ROUTE('+GET       /api/files/',        files_browse);
	ROUTE('+POST      /api/upload/ @upload  <10MB',        upload);
	ROUTE('+GET       /backup/              <60s',         backup);
	ROUTE('+POST      /restore/    @upload  <100MB <60s',  restore);

	// Settings
	ROUTE('+API    /api/    -settings             --> Settings/read');
	ROUTE('+API    /api/    +settings_save        --> Settings/save');
	ROUTE('+API    /api/    -settings_groups      --> Settings/groups');

	ROUTE('FILE /download/*.*', files);
};

function view_index($) {

	var plugins = [];
	var language = ($.user ? $.user.language || '' : '');

	for (var key in F.plugins) {
		var item = F.plugins[key];
		var obj = {};
		obj.id = item.id;
		obj.routes = item.routes;
		obj.position = item.position;
		obj.name = TRANSLATE(language, item.name);
		obj.icon = item.icon;
		obj.import = item.import ? '/_{id}/{import}'.args(item) : '';
		obj.hidden = item.hidden;
		plugins.push(obj);
	}

	plugins.quicksort('position');

	if ($.url === '/' && $.query.url && ((/^http(s)?:\/\/[a-z0-9]+/).test($.query.url))) {
		var opt = {};
		opt.method = 'GET';
		opt.url = $.query.url;
		opt.dnscache = true;
		opt.limit = 100;
		opt.timeout = 3000;
		opt.callback = function(err, response) {
			if (err)
				$.json(err);
			else
				$.view('external', response.body);
		};

		REQUEST(opt);

	} else {
		if (MAIN.db.config.secured && !$.user)
			$.invalid(401);
		else
			$.view('index', plugins);
	}
}

const isIMAGE = { jpg: 1, png: 1, gif: 1, svg: 1 };

function files($) {
	var arr = $.split[1].split('-');
	var id = arr[0];
	var hash = arr[0].makeid();
	if (arr[1] === hash)
		$.filefs('files', id, !isIMAGE[$.ext]);
	else
		$.invalid(404);
}

function upload($) {

	var file = $.files[0];

	if (!file) {
		$.json(null);
		return;
	}

	if (!file.extension) {
		file.extension = 'dat';
		file.filename += '.dat';
	}

	var id = UID();

	FILESTORAGE('files').save(id, file.filename, file.stream(), function(err, meta) {

		if (err) {
			$.invalid('error-filetype', err + '');
			return;
		}

		var w = meta.width || 0;
		var h = meta.height || 0;

		meta.url = '/download/' + id + '-' + id.makeid() + '-' + w + 'x' + h + '-1.' + file.extension;
		$.json(meta);
	});
}

function backup($) {

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

function restore($) {

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

async function clean($) {

	if (!$.user.sa) {
		$.invalid(401);
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

	$.success(rem.length);
}

async function files_browse($) {

	var files = await MAIN.fs.browse2();
	var index = files.findIndex('id', 'meta');
	files.splice(index, 1);

	for (var file of files)
		file.url = '/download/' + file.id + '-' + file.id.makeid() + '-' + (file.width || 0) + 'x' + (file.height || 0) + '-1.' + file.ext;

	$.json(files);
}