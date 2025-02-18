if (!CONF.cdn)
	CONF.cdn = '//cdn.componentator.com';

// Fixed settings
CONF.$customtitles = true;
CONF.version = '1';
CONF.op_icon = 'ti ti-book-open';

ON('ready', function() {

	// Icons
	COMPONENTATOR('ui', 'exec,centered,search,searchinput,directory,input,locale,message,errorhandler,viewbox,icons,menu,validate,validation,checkboxlist,loading,spotlight,movable,textboxlist,approve,radiobutton,clipboard,shortcuts,importer,backtotop,layout,selected,form,ready,box,cloudeditor,tabmenu,colorpicker,notify,filebrowser,page,autofill,enter,miniform', true);

});