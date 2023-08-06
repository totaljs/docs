const USER = { id: 'admin', name: 'John Connor', sa: true };

AUTH(function($) {
	if (CONF.op_restoken && CONF.op_reqtoken)
		OpenPlatform.auth($);
	else
		$.success(USER);
});