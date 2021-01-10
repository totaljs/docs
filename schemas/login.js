NEWSCHEMA('Login', function(schema) {

	schema.define('email', 'Email', true);
	schema.define('password', 'String(30)', true);

	schema.addWorkflow('exec', function($, model) {

		NOSQL('users').read().where('email', model.email).where('password', model.password.sha256(CONF.admin_password)).callback(function(err, response) {

			if (!response) {
				$.invalid('error-credentials');
				return;
			}

			if (response.isdisabled) {
				$.invalid('error-blocked');
				return;
			}

			delete response.password;

			var opt = {};
			opt.name = CONF.admin_cookie;
			opt.key = CONF.admin_secret;
			opt.id = response.id;
			opt.expire = '1 month';
			opt.data = response;
			opt.note = $.ua + ' (' + $.ip + ')';

			SESSION().setcookie($, opt, $.done());

		});

	});

});