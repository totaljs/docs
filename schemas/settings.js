NEWACTION('Settings/read', {
	name: 'Read settings',
	action: function($) {
		if ($.user.sa)
			$.callback(MAIN.db.config);
		else
			$.invalid(401);
	}
});

NEWACTION('Settings/save', {
	name: 'Save settings',
	input: '*name:String, *url:URL, password:String, color:Color, darkmode:Boolean, secured:Boolean, groups:[String], op_restoken:String, op_reqtoken:String',
	action: function($, model) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		MAIN.db.config = model;
		FUNC.save();

		$.action('Settings/load').callback(ERROR('Settings/load'));
		$.success();
	}
});

NEWACTION('Settings/load', {
	name: 'Load settings',
	action: function($) {

		var db = MAIN.db;
		var config = db.config;

		if (config.name)
			CONF.name = config.name;

		CONF.op_reqtoken = config.op_reqtoken;
		CONF.op_restoken = config.op_restoken;

		if (config.password)
			CONF.contentpassword = config.password.sha256(CONF.private_secret);
		else
			delete CONF.contentpassword;

		$.success();
	}
});

NEWACTION('Settings/groups', {
	name: 'List of groups',
	action: function($) {
		$.callback(MAIN.db.config.groups);
	}
});