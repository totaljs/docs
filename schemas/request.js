NEWSCHEMA('Request/KeyValue', function(schema) {
	schema.define('name', String, true);
	schema.define('value', String, true);
});

NEWSCHEMA('Request', function(schema) {

	schema.define('method', ['GET', 'POST', 'PUT', 'DELETE', 'API', 'PATCH'], true);
	schema.define('url', 'URL', true);
	schema.define('query', String);
	schema.define('args', Object);
	schema.define('headers', '[Request/KeyValue]');
	schema.define('body', Object);
	schema.define('action', String);

	schema.addWorkflow('exec', function($, model) {

		if (BLOCKED($, 20, '1 minute')) {
			$.invalid('@(Exceeded max. request limit)');
			return;
		}

		var opt = {};

		if (model.args)
			model.url = model.url.arg(model.url);

		opt.url = model.url + (model.query ? ('?' + model.query) : '');

		// Max. 5 kB limit
		opt.limit = 1024 * 5;

		NOSQL('requests').insert({ method: model.method, url: model.url, body: model.body, headers: model.headers, action: model.action, dtcreated: NOW, ip: $.ip, ua: $.ua });

		if (model.method !== 'GET' && model.method !== 'DELETE') {
			if (model.method === 'API') {
				opt.method = 'API';
				opt.body = {};
				opt.body.data = model.body;
				opt.body.schema = model.action;
			} else {
				opt.method = model.method;
				opt.body = model.body;
			}

			opt.body = JSON.stringify(opt.body);
			opt.type = 'json';
		}

		for (var i = 0; i < model.headers.length; i++) {
			var header = model.headers[i];
			if (header.value) {
				if (header.name === 'cookie') {
					opt.cookies = {};
					var cookies = header.value.split(/,/g).trim();
					for (var j = 0; j < cookies.length; j++) {
						var cookie = cookies[j].split(/=|:/);
						opt.cookies[cookie[0]] = cookie[1];
					}
				} else {
					if (!opt.headers)
						opt.headers = {};
					opt.headers[header.name] = header.value;
				}
			}
		}

		opt.callback = function(err, response) {
			if (err) {
				$.invalid(err);
			} else {
				$.success({ status: response.status, body: response.body });
			}
		};

		REQUEST(opt);
	});

});