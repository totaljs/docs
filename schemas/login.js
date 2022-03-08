NEWSCHEMA('Login', function(schema) {

	schema.define('login', 'String(150)', true);
	schema.define('password', 'String(30)', true);

	schema.addWorkflow('exec', function($, model) {

		if (BLOCKED($, 10)) {
			$.invalid('@(Invalid credentials)');
			return;
		}

		NOSQL('users').read().where('login', model.login).where('password', model.password.sha256(CONF.admin_password)).callback(function(err, response) {

			if (!response) {
				$.invalid('@(Invalid credentials)');
				return;
			}

			if (response.isdisabled) {
				$.invalid('@(Account has been blocked)');
				return;
			}

			BLOCKED($, -1);
			delete response.password;

			var opt = {};
			opt.name = CONF.admin_cookie;
			opt.key = CONF.admin_secret;
			opt.id = response.id;
			opt.expire = '1 month';
			opt.data = response;
			opt.note = $.ua + ' (' + $.ip + ')';

			PREF.login && PREF.set('login', null);

			SESSION().setcookie($, opt, $.done());

		});

	});

});