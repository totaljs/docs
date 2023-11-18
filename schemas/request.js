NEWSCHEMA('@Request/KeyValue', '*name,*value');
NEWSCHEMA('@Request', '*method:{GET|POST|PUT|DELETE|API|PATCH},*url:URL,query,args:Object,headers:[@Request/KeyValue],body:Object,action');

NEWACTION('Request/exec', {
	name: 'Exec request',
	input: '@Request',
	action: function($, model) {

		if (BLOCKED($, 20, '1 minute')) {
			$.invalid('Exceeded max. request limit');
			return;
		}

		var opt = {};

		if (model.args)
			model.url = model.url.arg(model.args);

		if (model.action)
			model.action = model.action.arg(model.args) + (model.query ? ('?' + model.query) : '');

		opt.url = model.url + (!model.action && model.query ? ('?' + model.query) : '');

		// Max. 5 kB limit
		opt.limit = 1024 * 5;

		// NOSQL('requests').insert({ method: model.method, url: model.url, body: model.body, headers: model.headers, action: model.action, dtcreated: NOW, ip: $.ip, ua: $.ua });

		if (model.method !== 'GET' && model.method !== 'DELETE') {
			if (model.method === 'API') {
				opt.method = 'POST';
				opt.body = {};
				opt.body.data = model.body;
				opt.body.schema = model.action.replace(/^(-|\+|\#)/, '');

				if (model.query)
					opt.body.schema += '?' + model.query;

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
			if (err)
				$.invalid(err);
			else
				$.success({ status: response.status, body: response.body, headers: response.headers });
		};

		REQUEST(opt);
	}
});