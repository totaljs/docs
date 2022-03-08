NEWSCHEMA('Settings', function(schema) {

	schema.define('name', String, true);
	schema.define('url', 'URL', true);
	schema.define('password', String);
	schema.define('color', 'Color');
	schema.define('darkmode', Boolean);

	// schema.define('smtp', String);
	// schema.define('smtp_options', 'JSON');
	schema.define('groups', '[String]');

	schema.setRead(function($) {
		if ($.user.sa)
			$.callback(MAIN.db.config);
		else
			$.invalid(401);
	});

	schema.setSave(function($) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		MAIN.db.config = $.model;
		FUNC.save();
		EXEC('-Settings --> load', NOOP);
		$.success();
	});

	schema.addWorkflow('load', function($) {

		var config = MAIN.db.config;

		if (config.name)
			CONF.name = config.name;

		if (config.password)
			CONF.contentpassword = config.password.sha256(CONF.admin_secret);
		else
			delete CONF.contentpassword;

		$.success();
	});

	schema.addWorkflow('groups', function($) {
		$.callback(MAIN.db.config.groups);
	});

});