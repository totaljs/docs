NEWSCHEMA('Password', function(schema) {

	schema.define('password', String, true);

	schema.addWorkflow('exec', function($, model) {

		if (BLOCKED($, 10)) {
			$.invalid('@(Invalid password)');
			return;
		}

		if (model.password === MAIN.db.config.password) {
			BLOCKED($, -1);
			$.cookie(CONF.password_cookie, CONF.contentpassword, '1 month');
			$.success();
		} else
			$.invalid('@(Invalid password)');

	});

});