NEWSCHEMA('Settings', function(schema) {

	schema.define('name', String, true);
	// schema.define('url', 'URL', true);
	// schema.define('smtp', String);
	// schema.define('smtp_options', 'JSON');
	// schema.define('darkmode', Boolean);
	schema.define('groups', '[String]');

	schema.setRead(function($) {

		if (!$.user.sa) {
			$.invalid('error-permissions');
			return;
		}

		if (PREF.settings) {
			var model = CLONE(PREF.settings);

			if (model.users) {
				for (var i = 0; i < model.users.length; i++) {
					var item = model.users[i];
					item.password = '*********';
				}
			}

			$.callback(model);

		} else
			$.callback({});
	});

	schema.setSave(function($) {

		if (!$.user.sa) {
			$.invalid('error-permissions');
			return;
		}

		var model = $.clean();
		PREF.set('settings', model);
		$WORKFLOW('Settings', 'load', $.done());
	});

	schema.addWorkflow('load', function($) {

		var settings = PREF.settings;
		if (settings)
			CONF.name = settings.name;
		$.success();
	});

});

ON('ready', function() {
	$WORKFLOW('Settings', 'load', NOOP);
});