COMPONENT('items', 'lnew:new;lchangelog:Changelog;ldeprecated:Deprecated;lcreated:Created;lupdated:Updated;lproperties:Properties;lmethods:Methods;lconfig:Configuration;lcommands:Commands;levents:Events;ldelegates:Delegates;lendpoints:Endpoints;lfaq:FAQ;ltopics:Topics;lhelp:Tips and tricks;lglossary:Glossary', function(self, config, cls) {

	var cls2 = '.' + cls;
	var skiphash = false;

	var moveto = function(id) {
		var el = self.find('.ui-items-topic[data-id="{0}"]'.format(id));
		if (el.length) {
			if (!el.hclass('selected'))
				el.find('label').trigger('click');
			el.closest('.ui-scrollbar-area').scrollTop(el.offset().top - 50);
		}
	};

	$(W).on('hashchange', function() {

		if (skiphash) {
			skiphash = false;
			return;
		}

		var hash = location.hash.substring(1);
		if (hash)
			setTimeout2(self.ID + 'hash', moveto, 100, null, hash);
	});

	self.make = function() {

		self.event('click', 'a', function(e) {
			var url = $(this).attr('href');
			if (url.charAt(0) === '#') {
				setTimeout2(self.ID + 'hash', moveto, 100, null, url.substring(1));
			} else if (url.charAt(0) === '/' && url.substring(0, 5) !== '/down') {
				e.preventDefault();
				REDIRECT(url);
			}
		});

		self.event('click', 'label', function() {
			var el = $(this);
			var topic = el.closest(cls2 + '-topic');
			if (topic.length) {
				var id = topic.attrd('id');
				var item = self.get().findItem('id', id);
				var icon = topic.find('label').find('i');
				var content = topic.find(cls2 + '-content');
				if (content.length) {
					content.tclass('hidden');
					topic.tclass('selected');
					skiphash = true;
					location.hash = topic.hclass('selected') ? id : '';
				} else {
					var changelog = item.changelog ? '<div class="{0}-changelog"><b>{2}:</b>{1}</div>'.format(cls, item.changelog.markdown({ wrap: false, images: false, links: false, br: false, headlines: false, tables: false, hr: false, sections: false, blockquotes: false, footnotes: false, linetag: 'div' }), config.lchangelog) : '';
					var meta = '<dl>';

					meta += '<dt>{2}</dt><dd>{0} by <b>{1}</b></dd>'.format(item.dtcreated.format(), item.creator, config.lcreated);

					if (item.updater && item.dtupdated)
						meta += '<dt>{2}</dt><dd>{0} by <b>{1}</b></dd>'.format(item.dtupdated.format(), item.updater, config.lupdated);

					meta += '</dl>';

					topic.append('<div class="{0}-content markdown-small">{1}{2}{3}<div class="{0}-meta">{4}</div></div>'.format(cls, item.deprecated ? '<div class="{0}-deprecated-badge"><i class="ti ti-warning mr5"></i>{1}</div>'.format(cls, config.ldeprecated) : '', changelog, item.body.markdown(), meta));
					topic.aclass('selected');
					icon.attrd('class', icon.attr('class'));
					skiphash = true;
					location.hash = id;
					FUNC.markdownredraw(topic);
				}

				var sel = 'ti ti-angle-down';

				if (content.hclass('hidden'))
					icon.rclass(sel).aclass(icon.attrd('class'));
				else
					icon.rclass().aclass(sel);
			}
		});

		self.event('click', cls2 + '-edit', function() {
			var el = $(this);
			EXEC(self.makepath(config.edit), el, el.attrd('id'));
		});

		self.event('contextmenu', cls2 + '-text,' + cls2 + '-topic', function(e) {

			if (!W.user)
				return;

			var el = $(this);

			if (el.hclass(cls + '-text'))
				el = $(el[0].children[0]);

			e.preventDefault();
			EXEC(self.makepath(config.edit), el, el.attrd('id'), e);
		});
	};

	function higlight_rest(name) {

		var index = name.indexOf(' ');
		var method = name.substring(0, index);

		index = name.indexOf('?');
		var url = name.substring(method.length + 1, index === -1 ? name.length : index);
		var arg = index === -1 ? '' : name.substring(index);

		return '<span class="method {0}">{0}</span><span class="url">{1}</span>'.format(method.toUpperCase().encode(), url.encode()) + (arg ? '<span class="query">{0}</span>'.format(arg) : '');
	}

	self.setter = function(value) {

		if (!value) {
			self.empty();
			return;
		}

		var types = {};
		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			if (types[item.type])
				types[item.type].push(item);
			else
				types[item.type] = [item];
		}

		var builder = [];
		var topics = [];
		var topiclist = [];
		var bottom = [];

		if (types.text) {
			types.text.quicksort('dtcreated');

			var tmp = [];

			for (var i = 0; i < types.text.length; i++) {
				var item = types.text[i];
				// <div class="{0}-content-name">{3}</div>
				var md = '<div class="{0}-text"><span data-id="{2}" class="{0}-edit"><i class="ti ti-pencil"></i></span><div class="{0}-content">{1}</div></div>'.format(cls, item.body.markdown(), item.id, item.name);
				if (item.bottom)
					bottom.push(md);
				else
					tmp.push(md);
			}

			if (tmp.length) {
				builder.push('<div>');
				builder.push.apply(builder, tmp);
				builder.push('</div>');
			}
		}

		var maketopics = function(type, arr) {


			var plus = '';
			topics.push('<div class="{0}-topics {0}-{1}">'.format(cls, type));

			switch (type) {
				case 'property':
					type = config.lproperties;
					plus += ';';
					break;
				case 'method':
					type = config.lmethods;
					plus += ';';
					break;
				case 'command':
					type = config.lcommands;
					break;
				case 'config':
					type = config.lconfig;
					break;
				case 'event':
					type = config.levents;
					plus += ';';
					break;
				case 'delegate':
					type = config.ldelegates;
					plus += ';';
					break;
				case 'rest':
					type = config.lendpoints;
					break;
				case 'help':
					type = config.lhelp;
					break;
				case 'glossary':
					type = config.lglossary;
					break;
				case 'faq':
					type = config.lfaq;
					break;
			}

			var typeslug = type.slug();
			topiclist.push('<li><a href="#{0}">{1}</a></li>'.format(typeslug, type));
			topics.push('<h2 id="{0}">{1}</h2>'.format(typeslug, type));

			for (var i = 0; i < arr.length; i++) {
				var item = arr[i];
				var name = item.name.encode();
				var icon = item.icon || 'ti ti-angle-right';
				var version = item.version ? '<span class="version">{0}</span>'.format(((/^\+v/).test(item.version) ? '' : '+v') + item.version.encode()) : '';
				var newbie = item.newbie ? '<b>{0}</b>'.format(config.lnew) : '';
				var deprecated = item.deprecated ? ' {0}-deprecated'.format(cls) : '';

				if (plus && name.charAt(name.length - 1) !== ';')
					name += plus;

				if (item.type === 'rest')
					name = higlight_rest(name);

				if (item.deprecated)
					name = name + '<strong class="badge badge-silver badge-small ml5">{0}</strong>'.format(config.ldeprecated);

				topics.push('<div class="{0}-topic{7}" data-id="{1}"><span data-id="{1}" class="{0}-edit"><i class="ti ti-pencil"></i></span>{8}<label{4}>{5}<i class="{3}"></i>{2}{6}</label></div>'.format(cls, item.id, name, icon, item.color ? ' style="color:{0}"'.format(item.color) : '', version, newbie, deprecated, (item.note ? '<em>{0}</em>'.format(item.note) : '')));
			}

			topics.push('</div>');
		};

		if (types.glossary)
			maketopics('glossary', types.glossary);

		if (types.help)
			maketopics('help', types.help);

		if (types.property)
			maketopics('property', types.property);

		if (types.delegate)
			maketopics('delegate', types.delegate);

		if (types.method)
			maketopics('method', types.method);

		if (types.event)
			maketopics('event', types.event);

		if (types.command)
			maketopics('command', types.command);

		if (types.rest)
			maketopics('rest', types.rest);

		if (types.faq)
			maketopics('faq', types.faq);

		if (topics.length)
			builder.push(topics.join(''));

		if (bottom.length) {
			builder.push('<div class="{0}-bottom">'.format(cls));
			builder.push.apply(builder, bottom);
			builder.push('</div>');
		}

		if (topiclist.length && (types.text || topiclist.length > 1))
			builder.unshift('<div class="{0}-topiclist"><div><i class="ti ti-bookmark"></i>{2}</div><ul>{1}</ul></div>'.format(cls, topiclist.join('\n'), config.ltopics));

		delete types.text;

		self.html(builder.join(''));
		FUNC.markdownredraw(self.element);
	};
});

COMPONENT('nav', function(self, config, cls) {

	var prev;

	self.make = function() {
		self.aclass(cls);
		self.datasource(config.datasource, self.redraw);
		self.event('click', 'span', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var el = $(this);
			config.edit && EXEC(self.makepath(config.edit), el, el.closest('li').attrd('id'));
		});

	};

	self.redraw = function(path, value) {

		if (!value)
			return;

		var groups = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];

			if (!item.group)
				item.group = '$';

			if (groups[item.group])
				groups[item.group].push(item);
			else
				groups[item.group] = [item];
		}

		var render = function(group, items) {
			if (group !== '$')
				builder.push('<div class="group">{0}</div>'.format(group));
			items.quicksort('sortindex');
			builder.push('<ul>');
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var icon = item.icon ? ('<i class="{0}"{1}></i>').format(item.icon, item.color ? (' style="color:' + item.color + '"') : '') : '';
				builder.push(('<li data-id="{2}"' + (item.deprecated ? ' class="deprecated"' : '') + '><a href="{0}" class="jR" draggable="true"><span><i class="ti ti-pencil"></i></span>{3}{5}{1}{4}</a></li>').format(item.url, item.name.encode(), item.id, icon, item.newbie ? '<b>new</b>' : '', item.version ? '<em>{0}</em>'.format(item.version.encode()) : ''));
			}
			builder.push('</ul>');
		};

		var builder = [];
		if (groups.$) {
			render('$', groups.$);
			delete groups.$;
		}

		var keys = Object.keys(groups);
		keys.quicksort();
		for (var i = 0; i < keys.length; i++) {
			groups[keys[i]].quicksort('name');
			render(keys[i], groups[keys[i]]);
		}

		self.html(builder.join(''));
	};

	self.setter = function(value) {
		prev && prev.rclass('selected');
		if (value)
			prev = self.find('li[data-id="{0}"]'.format(value)).aclass('selected');
	};

});

COMPONENT('markdown', 'copyclipboard:Copy to clipboard', function(self, config) {

	self.readonly();
	self.singleton();
	self.blind();
	self.nocompile();

	self.make = function() {
		// Remove from DOM because Markdown is used as a String prototype and Tangular helper
		setTimeout(function() {
			self.remove();
		}, 500);

		$(document).on('click', '.markdown-showsecret,.markdown-showblock', function() {
			var el = $(this);
			var next = el.next();
			next.tclass('hidden');
			var is = next.hclass('hidden');
			var icons = el.find('i');
			if (el.hclass('markdown-showsecret')) {
				icons.eq(0).tclass('ti-unlock', !is).tclass('ti-lock', is);
				icons.eq(1).tclass('ti-angle-up', !is).tclass('ti-angle-down', is);
			} else {
				icons.eq(0).tclass('ti-minus', !is).tclass('ti-plus', is);
				el.tclass('markdown-showblock-visible', !is);
			}
			el.find('b').html(el.attrd(is ? 'show' : 'hide'));
		});
	};

	(function Markdown() {

		var keywords = /(^|\s)\{.*?\}\(.*?\)/g;
		var linksexternal = /(https|http):\/\//;
		var format = /__.*?__|_.*?_|\*\*.*?\*\*|\*.*?\*|~~.*?~~|~.*?~/g;
		var ordered = /^[a-z|0-9]{1}\.\s|^-\s/i;
		var orderedsize = /^(\s|\t)+/;
		var code = /`.*?`/g;
		var encodetags = /<|>/g;
		var regdash = /-{2,}/g;
		var regicons = /(^|[^\w]):((fab\s|far\s|fas\s|fal\s|fad\s|fa\s|ti\s)(fa|ti)\-)?[a-z-]+(\s#[a-f0-9A-F]+)?:([^\w]|$)/g;
		var regemptychar = /\s|\W/;
		var regtags = /<[^>]*>/g;

		var encode = function(val) {
			return '&' + (val === '<' ? 'lt' : 'gt') + ';';
		};

		function markdown_code(value) {
			return '<code>' + value.substring(1, value.length - 1) + '</code>';
		}

		function markdown_imagelinks(value) {
			var end = value.lastIndexOf(')') + 1;
			var img = value.substring(0, end);
			var url = value.substring(end + 2, value.length - 1);
			var label = markdown_links(img);
			var footnote = label.substring(0, 13);

			if (footnote === '<sup data-id=' || footnote === '<span data-id' || label.substring(0, 9) === '<a href="')
				return label;

			return '<a href="' + url + '"' + (linksexternal.test(url) ? ' target="_blank"' : '') + '>' + label + '</a>';
		}

		function markdown_table(value, align, ishead) {

			var columns = value.substring(1, value.length - 1).split('|');
			var builder = '';

			for (var i = 0; i < columns.length; i++) {
				var column = columns[i].trim();
				if (column.charAt(0) == '-')
					continue;
				var a = align[i];
				builder += '<' + (ishead ? 'th' : 'td') + (a && a !== 'left' ? (' class="' + a + '"') : '') + '>' + column + '</' + (ishead ? 'th' : 'td') + '>';
			}

			return '<tr>' + builder + '</tr>';
		}

		function markdown_links(value) {
			var end = value.lastIndexOf(']');
			var img = value.charAt(0) === '!';
			var text = value.substring(img ? 2 : 1, end);
			var link = value.substring(end + 2, value.length - 1);

			// footnotes
			if ((/^#\d+$/).test(link)) {
				return (/^\d+$/).test(text) ? '<sup data-id="{0}" class="markdown-footnote">{1}</sup>'.format(link.substring(1), text) : '<span data-id="{0}" class="markdown-footnote">{1}</span>'.format(link.substring(1), text);
			}

			if (link.substring(0, 4) === 'www.')
				link = 'https://' + link;

			var nofollow = link.charAt(0) === '@' ? ' rel="nofollow"' : linksexternal.test(link) ? ' target="_blank"' : '';
			return '<a href="' + link + '"' + nofollow + '>' + text + '</a>';
		}

		function markdown_image(value) {

			var end = value.lastIndexOf(']');
			var text = value.substring(2, end);
			var link = value.substring(end + 2, value.length - 1);
			var responsive = 1;
			var f = text.charAt(0);

			if (f === '+') {
				responsive = 2;
				text = text.substring(1);
			} else if (f === '-') {
				// gallery
				responsive = 3;
				text = text.substring(1);
			}

			return '<img src="' + link + '" alt="' + text + '"' + (responsive === 1 ? ' class="img-responsive"' : responsive === 3 ? ' class="markdown-gallery"' : '') + ' border="0" loading="lazy" />';
		}

		function markdown_keywords(value) {

			var plus = value.charAt(0);
			var f = 2;

			if (plus === '{') {
				f = 1;
				plus = '';
			}

			var keyword = value.substring(f, value.indexOf('}'));
			var type = value.substring(value.lastIndexOf('(') + 1, value.lastIndexOf(')'));
			return plus + '<span class="markdown-keyword" data-type="{0}">{1}</span>'.format(type, keyword);
		}

		function markdown_links2(value) {
			value = value.substring(4, value.length - 4);
			return '<a href="' + (value.isEmail() ? 'mailto:' : linksexternal.test(value) ? '' : 'http://') + value + '" target="_blank">' + value + '</a>';
		}

		function markdown_format(value, index, text) {

			var p = text.charAt(index - 1);
			var n = text.charAt(index + value.length);

			if ((!p || regemptychar.test(p)) && (!n || regemptychar.test(n))) {

				var beg = '';
				var end = '';
				var tag;

				if (value.indexOf('*') !== -1) {
					tag = value.indexOf('**') === -1 ? 'em' : 'strong';
					beg += '<' + tag + '>';
					end = '</' + tag + '>' + end;
				}

				if (value.indexOf('_') !== -1) {
					tag = value.indexOf('__') === -1 ? 'u' : 'b';
					beg += '<' + tag + '>';
					end = '</' + tag + '>' + end;
				}

				if (value.indexOf('~') !== -1) {
					beg += '<strike>';
					end = '</strike>' + end;
				}

				var count = value.charAt(1) === value.charAt(0) ? 2 : 1;
				return beg + value.substring(count, value.length - count) + end;
			}

			return value;
		}

		function markdown_id(value) {
			value = value.replace(regtags, '');
			return value.slug().replace(regdash, '-');
		}

		function markdown_icon(value) {

			var beg = -1;
			var end = -1;
			var color;

			value = value.replace(/\s#[a-f0-9]+/i, function(val) {
				color = val;
				return '';
			});

			for (var i = 0; i < value.length; i++) {
				var code = value.charCodeAt(i);
				if (code === 58) {
					if (beg === -1)
						beg = i + 1;
					else
						end = i;
				}
			}

			var icon = value.substring(beg, end);
			if (icon.indexOf(' ') === -1)
				icon = 'ti ti-' + icon;
			return value.substring(0, beg - 1) + '<i class="' + icon + '"' + (color ? ' style="color:{0}"'.format(color) : '') + '></i>' + value.substring(end + 1);
		}

		function markdown_urlify(str) {
			return str.replace(/(^|\s)+(((https?:\/\/)|(www\.))[^\s]+)/g, function(url, b, c) {
				var len = url.length;
				var l = url.charAt(len - 1);
				var f = url.charAt(0);
				if (l === '.' || l === ',')
					url = url.substring(0, len - 1);
				else
					l = '';
				url = (c === 'www.' ? 'http://' + url : url).trim();
				return (f.charCodeAt(0) < 40 ? f : '') + '[' + url + '](' + url + ')' + l;
			});
		}

		FUNC.markdownredraw = function(el, opt) {

			if (!el)
				el = $('body');

			if (!opt)
				opt = EMPTYOBJECT;

			el.find('.lang-secret').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				el.parent().replaceWith('<div class="markdown-secret" data-show="{0}" data-hide="{1}"><span class="markdown-showsecret"><i class="ti ti-lock"></i><i class="pull-right ti ti-angle-down"></i><b>{0}</b></span><div class="hidden">'.format(opt.showsecret || 'Show secret data', opt.hidesecret || 'Hide secret data') + el.html().trim().markdown(opt.secretoptions, true) + '</div></div>');
			});

			el.find('.lang-video').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				var html = el.html();
				if (html.indexOf('youtube') !== -1)
					el.parent().replaceWith('<div class="markdown-video"><iframe src="https://www.youtube.com/embed/' + html.split('v=')[1] + '" frameborder="0" allowfullscreen></iframe></div>');
				else if (html.indexOf('vimeo') !== -1)
					el.parent().replaceWith('<div class="markdown-video"><iframe src="//player.vimeo.com/video/' + html.substring(html.lastIndexOf('/') + 1) + '" frameborder="0" allowfullscreen></iframe></div>');
			});

			el.find('.lang-barchart').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;

				t.$mdloaded = 1;
				var el = $(t);
				var arr = el.html().split('\n').trim();
				var series = [];
				var categories = [];
				var y = '';

				for (var i = 0; i < arr.length; i++) {
					var line = arr[i].split('|').trim();
					for (var j = 1; j < line.length; j++) {
						if (i === 0)
							series.push({ name: line[j], data: [] });
						else
							series[j - 1].data.push(+line[j]);
					}
					if (i)
						categories.push(line[0]);
					else
						y = line[0];
				}

				var options = {
					chart: {
						height: 300,
						type: 'bar',
					},
					yaxis: { title: { text: y }},
					series: series,
					xaxis: { categories: categories, },
					fill: { opacity: 1 },
				};

				var chart = new ApexCharts($(this).parent().empty()[0], options);
				chart.render();
			});

			el.find('.lang-linerchart').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;

				var el = $(t);
				var arr = el.html().split('\n').trim();
				var series = [];
				var categories = [];
				var y = '';

				for (var i = 0; i < arr.length; i++) {
					var line = arr[i].split('|').trim();
					for (var j = 1; j < line.length; j++) {
						if (i === 0)
							series.push({ name: line[j], data: [] });
						else
							series[j - 1].data.push(+line[j]);
					}
					if (i)
						categories.push(line[0]);
					else
						y = line[0];
				}

				var options = {
					chart: {
						height: 300,
						type: 'line',
					},
					yaxis: { title: { text: y }},
					series: series,
					xaxis: { categories: categories, },
					fill: { opacity: 1 },
				};

				var chart = new ApexCharts($(this).parent().empty()[0], options);
				chart.render();
			});

			el.find('.lang-iframe').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;

				var el = $(t);
				el.parent().replaceWith('<div class="markdown-iframe">' + el.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>') + '</div>');
			});

			el.find('pre code').each(function(i, block) {
				var t = this;
				if (t.$mdloaded)
					return;

				if (W.hljs) {
					t.$mdloaded = 1;
					var lines;
					var index;

					if (block.classList.contains('lang-bash')) {
						lines = block.innerHTML.split('\n');
						for (var i = 0; i < lines.length; i++) {

							var line = lines[i].split(' ');
							var comment = false;
							var plus = 0;
							var max = 2;

							for (var j = 0; j < max; j++) {
								var m = line[j];
								if (!m)
									continue;

								m = m.trim();

								if (m === '#') {
									// comment
									comment = true;
									break;
								}

								if (m === '$') {
									plus = -1;
									max++;
									line[j] = '<span class="hljs-number">$</span>';
									continue;
								}

								switch (j + plus) {
									case 0:
										line[j]= '<span class="hljs-built_in b">{0}</span>'.format(m);
										break;
									case 1:
										line[j]= '<span class="hljs-number">{0}</span>'.format(m);
										break;
								}
							}
							lines[i] = (comment ? '<span class="hljs-comment">{0}</span>' : '{0}').format(line.join(' '));
						}
						block.innerHTML = lines.join('\n').replace(/\t/, ' ');
						block.classList.add('hljs');
					} else if (block.classList.contains('lang-request')) {
						lines = block.innerHTML.split('\n');
						for (var i = 0; i < lines.length; i++) {
							var line = lines[i];
							if ((/^(GET|POST|PUT|PATCH|DELETE|API|HEAD)\s/).test(line)) {
								index = line.indexOf(' ');
								var method = line.substring(0, index);
								index = line.indexOf('?');
								var url = line.substring(method.length + 1, index === -1 ? line.length : index);
								var arg = index === -1 ? '' : line.substring(index);
								lines[i] = '<span class="method {0}">{0}</span> <span class="b">{1}</span>'.format(method.toUpperCase(), url) + (arg ? '<span class="hljs-comment">{0}</span>'.format(arg) : '');
							} else if ((/["a-z-]+(\s)?\:/i).test(line)) {
								index = line.indexOf(':');
								var name = line.substring(0, index);
								var value = line.substring(index + 1).trim();
								lines[i] = '<span class="hljs-built_in">{0}</span>: <span class="hljs-string">{1}</span>'.format(name, value);
							} else if (lines[i].trim()) {
								index = line.indexOf('//');
								if (index !== -1)
									lines[i] = '<span class="hljs-attribute">{0}</span>'.format(line.substring(0, index)) + '<span class="hljs-comment">{0}</span>'.format(line.substring(index));
								else
									lines[i] = '<span class="hljs-attribute">{0}</span>'.format(line);
							}
						}

						block.innerHTML = lines.join('\n').replace(/\t/, ' ');
						block.classList.add('hljs');
					} else if (block.classList.contains('lang-resource') || block.classList.contains('lang-config')) {

						lines = block.innerHTML.split('\n');

						for (var i = 0; i < lines.length; i++) {
							var line = lines[i];
							var clean = line.trim();

							if (clean.substring(0, 3) === '// ') {
								lines[i] = '<span class="hljs-comment">{0}</span>'.format(line);
								continue;
							}

							if (!clean)
								continue;

							index = line.indexOf(':');

							var name = '<span class="hljs-built_in">{0}</span>'.format(line.substring(0, index));
							var val = line.substring(index + 1);
							var value = ':<span class="{1}">{0}</span>'.format(val, (/(\s)[\d.\,]+/).test(val) ? 'hljs-number' : (/(\s)(true|false)+/).test(val) ? 'hljs-string' : 'hljs-attribute');
							lines[i] = name + value;
						}

						block.innerHTML = lines.join('\n').replace(/\t/, ' ');
						block.classList.add('hljs');
					} else if (block.classList.contains('lang-scr' + 'ipt')) {
						try {
							var code = block.innerHTML.replace(/&(lt|gt);/g, text => text.substring(1, 3) === 'lt' ? '<' : '>');
							var parent = block.parentNode.parentNode;
							parent.innerHTML = '';
							lines = new Function('el', 'var element=el;' + code)($(parent));
						} catch (e) {
							WARN('Invalid scri' + 'pt: ' + e);
						}
					} else
						W.hljs.highlightBlock(block);

					$(t).parent().parent().append('<div class="help"><span class="link exec" data-exec="common/copytoclipboard"><i class="ti ti-copy"></i>{0}</span></div>'.format(config.copyclipboard));
				}
			});

			el.find('a').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				var href = el.attr('href');
				var c = href.substring(0, 1);
				if (href === '#') {
					var beg = '';
					var end = '';
					/*
					var text = el.html();
					if (text.substring(0, 1) === '<')
						beg = '-';
					if (text.substring(text.length - 1) === '>')
						end = '-';*/
					el.attr('href', '#' + (beg + markdown_id(el.text()) + end));
				} else if (c !== '/' && c !== '#')
					el.attr('target', '_blank');
			});

			el.find('.markdown-code').rclass('hidden');
		};

		String.prototype.markdown = function(opt, nested) {

			// opt.wrap = true;
			// opt.linetag = 'p';
			// opt.ul = true;
			// opt.code = true;
			// opt.images = true;
			// opt.links = true;
			// opt.formatting = true;
			// opt.icons = true;
			// opt.tables = true;
			// opt.br = true;
			// opt.headlines = true;
			// opt.hr = true;
			// opt.blockquotes = true;
			// opt.sections = true;
			// opt.custom
			// opt.footnotes = true;
			// opt.urlify = true;
			// opt.keywords = true;
			// opt.emptynewline = true;

			var str = this;

			if (!opt)
				opt = {};

			var lines = str.split('\n');
			var builder = [];
			var ul = [];
			var table = false;
			var iscode = false;
			var isblock = false;
			var ishead = false;
			var isprevblock = false;
			var prev;
			var prevsize = 0;
			var previndex;
			var tmp;

			if (opt.wrap == null)
				opt.wrap = true;

			if (opt.linetag == null)
				opt.linetag = 'p';

			var closeul = function() {
				while (ul.length) {
					var text = ul.pop();
					builder.push('</' + text + '>');
				}
			};

			var formatlinks = function(val) {
				return markdown_links(val, opt.images);
			};

			var linkscope = function(val, index, callback) {

				var beg = -1;
				var beg2 = -1;
				var can = false;
				var skip = false;
				var find = false;
				var n;

				for (var i = index; i < val.length; i++) {
					var c = val.charAt(i);

					if (c === '[') {
						beg = i;
						can = false;
						find = true;
						continue;
					}

					var codescope = val.substring(i, i + 6);

					if (skip && codescope === '</code') {
						skip = false;
						i += 7;
						continue;
					}

					if (skip)
						continue;

					if (!find && codescope === '<code>') {
						skip = true;
						continue;
					}

					var il = val.substring(i, i + 4);

					if (il === '&lt;') {
						beg2 = i;
						continue;
					} else if (beg2 > -1 && il === '&gt;') {
						callback(val.substring(beg2, i + 4), true);
						beg2 = -1;
						continue;
					}

					if (c === ']') {

						can = false;
						find = false;

						if (beg === -1)
							continue;

						n = val.charAt(i + 1);

						// maybe a link mistake
						if (n === ' ')
							n = val.charAt(i + 2);

						// maybe a link
						can = n === '(';
					}

					if (beg > -1 && can && c === ')') {
						n = val.charAt(beg - 1);
						callback(val.substring(beg - (n === '!' ? 1 : 0), i + 1));
						can = false;
						find = false;
						beg = -1;
					}
				}

			};

			var formatline = function(line) {
				var tmp = [];
				return line.replace(code, function(text) {
					tmp.push(text);
					return '\0';
				}).replace(format, markdown_format).replace(/\0/g, function() {
					return markdown_code(tmp.shift());
				});
			};

			var imagescope = function(val) {

				var beg = -1;
				var can = false;
				var n;

				for (var i = 0; i < val.length; i++) {
					var c = val.charAt(i);

					if (c === '[') {
						beg = i;
						can = false;
						continue;
					}

					if (c === ']') {

						can = false;

						if (beg === -1)
							continue;

						n = val.charAt(i + 1);

						// maybe a link mistake
						if (n === ' ')
							n = val.charAt(i + 2);

						// maybe a link
						can = n === '(';
					}

					if (beg > -1 && can && c === ')') {
						n = val.charAt(beg - 1);
						var tmp = val.substring(beg - (n === '!' ? 1 : 0), i + 1);
						if (tmp.charAt(0) === '!')
							val = val.replace(tmp, markdown_image(tmp));
						can = false;
						beg = -1;
					}
				}


				return val;
			};

			for (var i = 0; i < lines.length; i++) {

				lines[i] = lines[i].replace(encodetags, encode);
				var three = lines[i].substring(0, 3);

				if (!iscode && (three === ':::' || (three === '==='))) {

					if (isblock) {
						if (opt.blocks !== false)
							builder[builder.length - 1] += '</div></div>';
						isblock = false;
						isprevblock = true;
						continue;
					}

					closeul();
					isblock = true;
					if (opt.blocks !== false) {
						line = lines[i].substring(3).trim();
						if (opt.formatting !== false)
							line = formatline(line);
						builder.push('<div class="markdown-block"><span class="markdown-showblock"><i class="ti ti-plus"></i>{0}</span><div class="hidden">'.format(line));
					}
					prev = '';
					continue;
				}

				if (!isblock && lines[i] && isprevblock) {
					builder.push('<br />');
					isprevblock = false;
				}

				if (three === '```') {

					if (iscode) {
						if (opt.code !== false)
							builder[builder.length - 1] += '</code></pre></div>';
						iscode = false;
						continue;
					}

					closeul();
					iscode = true;
					if (opt.code !== false)
						tmp = '<div class="markdown-code hidden"><pre><code class="lang-' + lines[i].substring(3) + '">';
					prev = 'code';
					continue;
				}

				if (iscode) {
					if (opt.code !== false)
						builder.push(tmp + lines[i]);
					if (tmp)
						tmp = '';
					continue;
				}

				var line = lines[i];

				if (opt.br !== false)
					line = line.replace(/&lt;br(\s\/)?&gt;/g, '<br />');

				if (line.length > 10 && opt.urlify !== false && opt.links !== false)
					line = markdown_urlify(line);

				if (opt.custom)
					line = opt.custom(line);

				if (line.length > 2 && line !== '***' && line !== '---') {
					if (opt.formatting !== false)
						line = formatline(line);
					if (opt.images !== false)
						line = imagescope(line);
					if (opt.links !== false) {
						linkscope(line, 0, function(text, inline) {
							if (inline)
								line = line.replace(text, markdown_links2);
							else if (opt.images !== false)
								line = line.replace(text, markdown_imagelinks);
							else
								line = line.replace(text, formatlinks);
						});
					}
					if (opt.keywords !== false)
						line = line.replace(keywords, markdown_keywords);

					if (opt.icons !== false)
						line = line.replace(regicons, markdown_icon);
				}

				if (!line) {
					if (table) {
						table = null;
						if (opt.tables !== false)
							builder.push('</tbody></table>');
					}
				}

				if (line === '' && lines[i - 1] === '') {
					closeul();
					if (opt.emptynewline !== false)
						builder.push('<br />');
					prev = 'br';
					continue;
				}

				if (line[0] === '|') {
					closeul();
					if (!table) {
						var next = lines[i + 1];
						if (next[0] === '|') {
							table = [];
							var columns = next.substring(1, next.length - 1).split('|');
							for (var j = 0; j < columns.length; j++) {
								var column = columns[j].trim();
								var align = 'left';
								if (column.charAt(column.length - 1) === ':')
									align = column[0] === ':' ? 'center' : 'right';
								table.push(align);
							}
							if (opt.tables !== false)
								builder.push('<table class="table table-bordered"><thead>');
							prev = 'table';
							ishead = true;
							i++;
						} else
							continue;
					}

					if (opt.tables !== false) {
						if (ishead)
							builder.push(markdown_table(line, table, true) + '</thead><tbody>');
						else
							builder.push(markdown_table(line, table));
					}
					ishead = false;
					continue;
				}

				if (line.charAt(0) === '#') {

					closeul();

					if (line.substring(0, 2) === '# ') {
						tmp = line.substring(2).trim();
						if (opt.headlines !== false)
							builder.push('<h1 id="' + markdown_id(tmp) + '">' + tmp + '</h1>');
						prev = '#';
						continue;
					}

					if (line.substring(0, 3) === '## ') {
						tmp = line.substring(3).trim();
						if (opt.headlines !== false)
							builder.push('<h2 id="' + markdown_id(tmp) + '">' + tmp + '</h2>');
						prev = '##';
						continue;
					}

					if (line.substring(0, 4) === '### ') {
						tmp = line.substring(4).trim();
						if (opt.headlines !== false)
							builder.push('<h3 id="' + markdown_id(tmp) + '">' + tmp + '</h3>');
						prev = '###';
						continue;
					}

					if (line.substring(0, 5) === '#### ') {
						tmp = line.substring(5).trim();
						if (opt.headlines !== false)
							builder.push('<h4 id="' + markdown_id(tmp) + '">' + tmp + '</h4>');
						prev = '####';
						continue;
					}

					if (line.substring(0, 6) === '##### ') {
						tmp = line.substring(6).trim();
						if (opt.headlines !== false)
							builder.push('<h5 id="' + markdown_id(tmp) + '">' + tmp + '</h5>');
						prev = '#####';
						continue;
					}
				}

				tmp = line.substring(0, 3);

				if (tmp === '---' || tmp === '***') {
					prev = 'hr';
					if (opt.hr !== false)
						builder.push('<hr class="markdown-line' + (tmp.charAt(0) === '-' ? '1' : '2') + '" />');
					continue;
				}

				// footnotes
				if ((/^#\d+:(\s)+/).test(line)) {
					if (opt.footnotes !== false) {
						tmp = line.indexOf(':');
						builder.push('<div class="markdown-footnotebody" data-id="{0}"><span>{0}:</span> {1}</div>'.format(line.substring(1, tmp).trim(), line.substring(tmp + 1).trim()));
					}
					continue;
				}

				if (line.substring(0, 5) === '&gt; ') {
					if (opt.blockquotes !== false)
						builder.push('<blockquote>' + line.substring(5).trim() + '</blockquote>');
					prev = '>';
					continue;
				}

				if (line.substring(0, 5) === '&lt; ') {
					if (opt.sections !== false)
						builder.push('<section>' + line.substring(5).trim() + '</section>');
					prev = '<';
					continue;
				}

				var tmpline = line.trim();

				if (opt.ul !== false && ordered.test(tmpline)) {

					var size = line.match(orderedsize);
					if (size)
						size = size[0].length;
					else
						size = 0;

					var append = false;

					if (prevsize !== size) {
						// NESTED
						if (size > prevsize) {
							prevsize = size;
							append = true;
							var index = builder.length - 1;
							builder[index] = builder[index].substring(0, builder[index].length - 5);
							prev = '';
						} else {
							// back to normal
							prevsize = size;
							builder.push('</' + ul.pop() + '>');
						}
					}

					var type = tmpline.charAt(0) === '-' ? 'ul' : 'ol';
					if (prev !== type) {
						var subtype;
						if (type === 'ol')
							subtype = tmpline.charAt(0);
						previndex = builder.push('<' + type + (subtype ? (' type="' + subtype + '"') : '') + '>') - 1;
						ul.push(type + (append ? '></li' : ''));
						prev = type;
						prevsize = size;
					}

					var tmpstr = (type === 'ol' ? tmpline.substring(tmpline.indexOf('.') + 1) : tmpline.substring(2));
					if (type !== 'ol') {
						var tt = tmpstr.substring(0, 3);
						if (tt === '[ ]' || tt === '[x]') {
							if (previndex != null)
								builder[previndex] = builder[previndex].replace('<ul', '<ul class="markdown-tasks"');
							previndex = null;
						}
					}

					builder.push('<li>' + tmpstr.trim().replace(/\[x\]/g, '<i class="ti ti-check-circle green"></i>').replace(/\[\s\]/g, '<i class="ti ti-circle"></i>') + '</li>');

				} else {
					closeul();
					line && builder.push((opt.linetag ? ('<' + opt.linetag + '>') : '') + line.trim() + (opt.linetag ? ('</' + opt.linetag + '>') : ''));
					prev = 'p';
				}
			}

			closeul();
			table && opt.tables !== false && builder.push('</tbody></table>');
			iscode && opt.code !== false && builder.push('</code></pre>');
			if (!opt.noredraw && typeof(window) === 'object')
				setTimeout(FUNC.markdownredraw, 1, null, opt);
			return (opt.wrap ? ('<div class="markdown' + (nested ? '' : ' markdown-container') + '">') : '') + builder.join('\n').replace(/\t/g, '    ') + (opt.wrap ? '</div>' : '');
		};

	})();

}, ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/highlight.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/github.min.css']);

COMPONENT('codemirror', 'linenumbers:true;required:false;trim:false;tabs:true;height:200;minheight:200', function(self, config, cls) {

	var editor, container;
	var cls2 = '.' + cls;

	self.getter = null;
	self.nocompile();

	self.reload = function() {
		editor.refresh();
		editor.display.scrollbars.update(true);
	};

	self.validate = function(value) {
		return (config.disabled || !config.required ? true : value && value.length > 0) === true;
	};

	self.insert = function(value) {
		editor.replaceSelection(value);
		self.change(true);
	};

	self.configure = function(key, value, init) {
		if (init)
			return;

		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				editor.readOnly = value;
				editor.refresh();
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				self.state(1, 1);
				break;
			case 'icon':
				self.find('i').rclass().aclass(value.indexOf(' ') === -1 ? ('ti ti-' + value) : value);
				break;
		}

	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {
		if (config.parent) {
			var parent = self.parent(config.parent);
			var h = parent.height();

			if (h < config.minheight)
				h = config.minheight;

			editor.setSize('100%', (h - config.margin) + 'px');
			self.css('height', h - config.margin);
		} else
			editor.setSize('100%', config.height + 'px');
	};

	self.make = function() {

		var findmatch = function() {

			if (config.mode === 'todo') {
				self.todo_done();
				return;
			}

			var sel = editor.getSelections()[0];
			var cur = editor.getCursor();
			var count = editor.lineCount();
			var before = editor.getLine(cur.line).substring(cur.ch, cur.ch + sel.length) === sel;
			var beg = cur.ch + (before ? sel.length : 0);
			for (var i = cur.line; i < count; i++) {
				var ch = editor.getLine(i).indexOf(sel, beg);
				if (ch !== -1) {
					editor.doc.addSelection({ line: i, ch: ch }, { line: i, ch: ch + sel.length });
					break;
				}
				beg = 0;
			}
		};

		var content = config.label || self.html();
		self.html(((content ? '<div class="{0}-label' + (config.required ? ' {0}-label-required' : '') + '">' + (config.icon ? '<i class="ti ti-' + config.icon + '"></i> ' : '') + content + ':</div>' : '') + '<div class="{0}"></div>').format(cls));
		container = self.find(cls2);

		var options = {};
		options.lineNumbers = config.linenumbers;
		options.mode = config.type || 'htmlmixed';
		options.indentUnit = 4;
		options.scrollbarStyle = 'simple';
		options.scrollPastEnd = true;
		options.extraKeys = { 'Cmd-D': findmatch, 'Ctrl-D': findmatch };

		if (config.tabs)
			options.indentWithTabs = true;

		if (config.type === 'markdown') {
			options.styleActiveLine = true;
			options.lineWrapping = true;
			options.matchBrackets = true;
		}

		options.showTrailingSpace = false;

		editor = CodeMirror(container[0], options);
		self.editor = editor;

		editor.on('keydown', function(editor, e) {

			if (e.shiftKey && e.ctrlKey && (e.keyCode === 40 || e.keyCode === 38)) {
				var tmp = editor.getCursor();
				editor.doc.addSelection({ line: tmp.line + (e.keyCode === 40 ? 1 : -1), ch: tmp.ch });
				e.stopPropagation();
				e.preventDefault();
			}

			if (e.keyCode === 13) {
				var tmp = editor.getCursor();
				var line = editor.lineInfo(tmp.line);
				if ((/^\t+$/).test(line.text))
					editor.replaceRange('', { line: tmp.line, ch: 0 }, { line: tmp.line, ch: line.text.length });
				return;
			}

			if (e.keyCode === 27)
				e.stopPropagation();

		});

		if (config.disabled) {
			self.aclass('ui-disabled');
			editor.readOnly = true;
			editor.refresh();
		}

		self.event('contextmenu', function(e) {
			e.preventDefault();
			e.stopPropagation();
			config.contextmenu && self.EXEC(config.contextmenu, e, editor);
		});

		editor.on('drop',function(editor, e) {
			config.drop && self.SEEX(config.drop, e, editor);
		});

		var can = {};
		can['+input'] = can['+delete'] = can.undo = can.redo = can.paste = can.cut = can.clear = true;

		editor.on('change', function(a, b) {

			if (config.disabled || !can[b.origin])
				return;

			setTimeout2(self.id, function() {
				var val = editor.getValue();

				if (config.trim) {
					var lines = val.split('\n');
					for (var i = 0, length = lines.length; i < length; i++)
						lines[i] = lines[i].replace(/\s+$/, '');
					val = lines.join('\n').trim();
				}

				self.getter2 && self.getter2(val);
				self.change(true);
				self.rewrite(val, 2);
				config.required && self.validate2();
			}, 200);

		});

		self.resize();
		self.on('resize + resize2', self.resize);
	};

	self.setter = function(value, path, type) {

		editor.setValue(value || '');
		editor.refresh();

		setTimeout(function() {
			editor.refresh();
			editor.scrollTo(0, 0);
			type && editor.setCursor(0);
		}, 200);

		setTimeout(function() {
			editor.refresh();
		}, 1000);

		setTimeout(function() {
			editor.refresh();
		}, 2000);
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		container.tclass(cls + '-invalid', invalid);
	};

}, ['//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.css', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/javascript/javascript.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/htmlmixed/htmlmixed.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/xml/xml.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/css/css.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/markdown/markdown.min.js', function(next) {

	CodeMirror.defineMode('totaljsresources', function() {
		var REG_KEY = /^[a-z0-9_\-.#]+/i;
		return {

			startState: function() {
				return { type: 0, keyword: 0 };
			},

			token: function(stream, state) {

				var m;

				if (stream.sol()) {

					var line = stream.string;
					if (line.substring(0, 2) === '//') {
						stream.skipToEnd();
						return 'comment';
					}

					state.type = 0;
				}

				m = stream.match(REG_KEY, true);
				if (m)
					return 'tag';

				if (!stream.string) {
					stream.next();
					return '';
				}

				var count = 0;

				while (true) {

					count++;
					if (count > 5000)
						break;

					var c = stream.peek();
					if (c === ':') {
						stream.skipToEnd();
						return 'def';
					}

					if (c === '(') {
						if (stream.skipTo(')')) {
							stream.eat(')');
							return 'variable-L';
						}
					}

				}

				stream.next();
				return '';
			}
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		function Bar(cls, orientation, scroll) {
			var self = this;
			self.orientation = orientation;
			self.scroll = scroll;
			self.screen = self.total = self.size = 1;
			self.pos = 0;

			self.node = document.createElement('div');
			self.node.className = cls + '-' + orientation;
			self.inner = self.node.appendChild(document.createElement('div'));

			CodeMirror.on(self.inner, 'mousedown', function(e) {

				if (e.which != 1)
					return;

				CodeMirror.e_preventDefault(e);
				var axis = self.orientation == 'horizontal' ? 'pageX' : 'pageY';
				var start = e[axis], startpos = self.pos;

				function done() {
					CodeMirror.off(document, 'mousemove', move);
					CodeMirror.off(document, 'mouseup', done);
				}

				function move(e) {
					if (e.which != 1)
						return done();
					self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
				}

				CodeMirror.on(document, 'mousemove', move);
				CodeMirror.on(document, 'mouseup', done);
			});

			CodeMirror.on(self.node, 'click', function(e) {
				CodeMirror.e_preventDefault(e);
				var innerBox = self.inner.getBoundingClientRect(), where;
				if (self.orientation == 'horizontal')
					where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;
				else
					where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
				self.moveTo(self.pos + where * self.screen);
			});

			function onWheel(e) {
				var moved = CodeMirror.wheelEventPixels(e)[self.orientation == 'horizontal' ? 'x' : 'y'];
				var oldPos = self.pos;
				self.moveTo(self.pos + moved);
				if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
			}
			CodeMirror.on(self.node, 'mousewheel', onWheel);
			CodeMirror.on(self.node, 'DOMMouseScroll', onWheel);
		}

		Bar.prototype.setPos = function(pos, force) {
			var t = this;
			if (pos < 0)
				pos = 0;
			if (pos > t.total - t.screen)
				pos = t.total - t.screen;
			if (!force && pos == t.pos)
				return false;
			t.pos = pos;
			t.inner.style[t.orientation == 'horizontal' ? 'left' : 'top'] = (pos * (t.size / t.total)) + 'px';
			return true;
		};

		Bar.prototype.moveTo = function(pos) {
			var t = this;
			t.setPos(pos) && t.scroll(pos, t.orientation);
		};

		var minButtonSize = 10;

		Bar.prototype.update = function(scrollSize, clientSize, barSize) {
			var t = this;
			var sizeChanged = t.screen != clientSize || t.total != scrollSize || t.size != barSize;

			if (sizeChanged) {
				t.screen = clientSize;
				t.total = scrollSize;
				t.size = barSize;
			}

			var buttonSize = t.screen * (t.size / t.total);
			if (buttonSize < minButtonSize) {
				t.size -= minButtonSize - buttonSize;
				buttonSize = minButtonSize;
			}

			t.inner.style[t.orientation == 'horizontal' ? 'width' : 'height'] = buttonSize + 'px';
			t.setPos(t.pos, sizeChanged);
		};

		function SimpleScrollbars(cls, place, scroll) {
			var t = this;
			t.addClass = cls;
			t.horiz = new Bar(cls, 'horizontal', scroll);
			place(t.horiz.node);
			t.vert = new Bar(cls, 'vertical', scroll);
			place(t.vert.node);
			t.width = null;
		}

		SimpleScrollbars.prototype.update = function(measure) {
			var t = this;
			if (t.width == null) {
				var style = window.getComputedStyle ? window.getComputedStyle(t.horiz.node) : t.horiz.node.currentStyle;
				if (style)
					t.width = parseInt(style.height);
			}

			var width = t.width || 0;
			var needsH = measure.scrollWidth > measure.clientWidth + 1;
			var needsV = measure.scrollHeight > measure.clientHeight + 1;

			t.vert.node.style.display = needsV ? 'block' : 'none';
			t.horiz.node.style.display = needsH ? 'block' : 'none';

			if (needsV) {
				t.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0));
				t.vert.node.style.bottom = needsH ? width + 'px' : '0';
			}

			if (needsH) {
				t.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
				t.horiz.node.style.right = needsV ? width + 'px' : '0';
				t.horiz.node.style.left = measure.barLeft + 'px';
			}

			return {right: needsV ? width : 0, bottom: needsH ? width : 0};
		};

		SimpleScrollbars.prototype.setScrollTop = function(pos) {
			this.vert.setPos(pos);
		};

		SimpleScrollbars.prototype.setScrollLeft = function(pos) {
			this.horiz.setPos(pos);
		};

		SimpleScrollbars.prototype.clear = function() {
			var parent = this.horiz.node.parentNode;
			parent.removeChild(this.horiz.node);
			parent.removeChild(this.vert.node);
		};

		CodeMirror.scrollbarModel.simple = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-simplescroll', place, scroll);
		};
		CodeMirror.scrollbarModel.overlay = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-overlayscroll', place, scroll);
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {
		CodeMirror.defineOption('showTrailingSpace', false, function(cm, val, prev) {
			if (prev == CodeMirror.Init)
				prev = false;
			if (prev && !val)
				cm.removeOverlay('trailingspace');
			else if (!prev && val) {
				cm.addOverlay({ token: function(stream) {
					for (var l = stream.string.length, i = l; i; --i) {
						if (stream.string.charCodeAt(i - 1) !== 32)
							break;
					}
					if (i > stream.pos) {
						stream.pos = i;
						return null;
					}
					stream.pos = l;
					return 'trailingspace';
				}, name: 'trailingspace' });
			}
		});
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		CodeMirror.defineOption('scrollPastEnd', false, function(cm, val, old) {
			if (old && old != CodeMirror.Init) {
				cm.off('change', onChange);
				cm.off('refresh', updateBottomMargin);
				cm.display.lineSpace.parentNode.style.paddingBottom = '';
				cm.state.scrollPastEndPadding = null;
			}
			if (val) {
				cm.on('change', onChange);
				cm.on('refresh', updateBottomMargin);
				updateBottomMargin(cm);
			}
		});

		function onChange(cm, change) {
			if (CodeMirror.changeEnd(change).line == cm.lastLine())
				updateBottomMargin(cm);
		}

		function updateBottomMargin(cm) {
			var padding = '';

			if (cm.lineCount() > 1) {
				var totalH = cm.display.scroller.clientHeight - 30;
				var lastLineH = cm.getLineHandle(cm.lastLine()).height;
				padding = (totalH - lastLineH) + 'px';
			}

			if (cm.state.scrollPastEndPadding != padding) {
				cm.state.scrollPastEndPadding = padding;
				cm.display.lineSpace.parentNode.style.paddingBottom = padding;
				cm.off('refresh', updateBottomMargin);
				cm.setSize();
				cm.on('refresh', updateBottomMargin);
			}

		}
	});

	next();
}]);

COMPONENT('table', 'highlight:true;unhighlight:true;multiple:false;pk:id;visibleY:1;scrollbar:0;pluralizepages:# pages,# page,# pages,# pages;pluralizeitems:# items,# item,# items,# items;margin:0', function(self, config, cls) {

	var cls2 = '.' + cls;
	var etable, ebody, eempty, ehead, eheadsize, efooter, container;
	var opt = { selected: [] };
	var templates = {};
	var sizes = {};
	var names = {};
	var aligns = {};
	var sorts = {};
	var dcompile = false;
	var prevsort;
	var prevhead;
	var extradata;

	self.readonly();
	self.nocompile();

	self.make = function() {

		self.aclass(cls + ' invisible' + (config.detail ? (' ' + cls + '-detailed') : '') + ((config.highlight || config.click || config.exec) ? (' ' + cls + '-selectable') : '') + (config.border ? (' ' + cls + '-border') : '') + (config.flat ? (' ' + cls + '-flat') : ''));

		self.find('script').each(function() {

			var el = $(this);
			var type = el.attrd('type');

			switch (type) {
				case 'detail':
					var h = el.html();
					dcompile = h.COMPILABLE();
					templates.detail = Tangular.compile(h);
					return;
				case 'empty':
					templates.empty = el.html();
					return;
			}

			var display = (el.attrd('display') || '').toLowerCase();
			var template = Tangular.compile(el.html());
			var size = (el.attrd('size') || '').split(',');
			var name = (el.attrd('head') || '').split(',');
			var align = (el.attrd('align') || '').split(',');
			var sort = (el.attrd('sort') || '').split(',');
			var i;

			for (i = 0; i < align.length; i++) {
				switch (align[i].trim()) {
					case '0':
						align[i] = 'left';
						break;
					case '1':
						align[i] = 'center';
						break;
					case '2':
						align[i] = 'right';
						break;
				}
			}

			display = (display || '').split(',').trim();

			for (i = 0; i < align.length; i++)
				align[i] = align[i].trim();

			for (i = 0; i < size.length; i++)
				size[i] = size[i].trim().toLowerCase();

			for (i = 0; i < sort.length; i++)
				sort[i] = sort[i].trim();

			for (i = 0; i < name.length; i++) {
				name[i] = name[i].trim().replace(/'[a-z-\s]+'/, function(val) {
					if (val.indexOf(' ') === -1)
						val = val + ' ti';
					return '<i class="ti-{0}"></i>'.format(val.replace(/'/g, ''));
				});
			}

			if (!size[0] && size.length === 1)
				size = EMPTYARRAY;

			if (!align[0] && align.length === 1)
				align = EMPTYARRAY;

			if (!name[0] && name.length === 1)
				name = EMPTYARRAY;

			if (display.length) {
				for (i = 0; i < display.length; i++) {
					templates[display[i]] = template;
					sizes[display[i]] = size.length ? size : null;
					names[display[i]] = name.length ? name : null;
					aligns[display[i]] = align.length ? align : null;
					sorts[display[i]] = sort.length ? sort : null;
				}
			} else {
				templates.lg = templates.md = templates.sm = templates.xs = template;
				sizes.lg = sizes.md = sizes.sm = sizes.xs = size.length ? size : null;
				names.lg = names.md = names.sm = names.xs = name.length ? name : null;
				sorts.lg = sorts.md = sorts.sm = sorts.xs = sort.length ? sort : null;
				aligns.lg = aligns.md = aligns.sm = aligns.xs = align.length ? align : null;
			}
		});

		self.html('<div class="{0}-headcontainer"><table class="{0}-head"><thead></thead></table></div><div class="{0}-container"><table class="{0}-table"><thead></thead><tbody class="{0}-tbody"></tbody></table><div class="{0}-empty hidden"></div></div>'.format(cls));
		etable = self.find(cls2 + '-table');
		ebody = etable.find('tbody');
		eempty = self.find(cls2 + '-empty').html(templates.empty || '');
		ehead = self.find(cls2 + '-head thead');
		eheadsize = etable.find('thead');
		container = self.find(cls2 + '-container');

		etable.on('click', 'button', function() {
			if (config.click) {
				var btn = $(this);
				var row = opt.items[+btn.closest('tr').attrd('index')];
				SEEX(self.makepath(config.click), btn[0].name, row, btn);
			}
		});

		if (config.paginate) {
			self.append('<div class="{0}-footer"><div class={0}-pagination-items hidden-xs"></div><div class="{0}-pagination"><button name="page-first" disabled><i class="fa fa-angle-double-left"></i></button><button name="page-prev" disabled><i class="fa fa-angle-left"></i></button><div><input type="text" name="page" maxlength="5" class="{0}-pagination-input" /></div><button name="page-next" disabled><i class="fa fa-angle-right"></i></button><button name="page-last" disabled><i class="fa fa-angle-double-right"></i></button></div><div class="{0}-pagination-pages"></div></div>'.format(cls));
			efooter = self.find(cls2 + '-footer');

			efooter.on('change', cls2 + '-pagination-input', function() {

				var value = self.get();
				var val = +this.value;

				if (isNaN(val))
					return;

				if (val >= value.pages)
					val = value.pages;
				else if (val < 1)
					val = 1;

				value.page = val;
			});

			efooter.on('click', 'button', function() {
				var data = self.get();

				var model = {};
				model.page = data.page;
				model.limit = data.limit;

				if (prevsort)
					model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';

				switch (this.name) {
					case 'page-first':
						model.page = 1;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-last':
						model.page = data.pages;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-prev':
						model.page -= 1;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-next':
						model.page += 1;
						SEEX(self.makepath(config.paginate), model);
						break;
				}
			});
		}

		if (config.scrollbar) {
			self.scrollbar = SCROLLBAR(container, { visibleY: !!config.visibleY });
			ehead.parent().parent().aclass(cls + '-scrollbar');
		}

		templates.empty && templates.empty.COMPILABLE() && COMPILE(eempty);

		self.event('click', '.sort', function() {

			var th = $(this);
			var i = th.find('i');
			var type;

			if (i.attr('class') === 'fa') {
				// no sort
				prevsort && prevsort.el.find('i').rclass2('fa-');
				i.aclass('fa-long-arrow-up');
				type = 'asc';
			} else if (i.hclass('fa-long-arrow-up')) {
				// ascending
				i.rclass('fa-long-arrow-up').aclass('fa-long-arrow-down');
				type = 'desc';
			} else if (i.hclass('fa-long-arrow-down')) {
				// descending
				i.rclass('fa-long-arrow-down');
				type = '';
			}

			var index = th.index();
			var data = self.get();

			prevsort = { index: index, type: type, el: th, name: sorts[WIDTH()][index] };

			if (config.paginate) {
				var model = {};
				model.page = data.page;
				model.limit = data.limit;
				model.sort = type ? (prevsort.name + '_' + type) : undefined;
				SEEX(self.makepath(config.paginate), model);
			} else if (prevsort.name) {
				opt.items = (data.items ? data.items : data).slice(0);
				if (type)
					opt.items.quicksort(prevsort.name, type === 'asc');
				else {
					var tmp = self.get() || EMPTYARRAY;
					opt.items = tmp.items ? tmp.items : tmp;
					prevsort = null;
				}
				opt.sort = type ? (prevsort.name + '_' + type) : undefined;
				config.filter && EXEC(self.makepath(config.filter), opt, 'sort');
				self.redraw();
			}
		});

		var blacklist = { A: 1, BUTTON: 1 };
		var dblclick = 0;

		var forceselect = function(el, index, is) {

			if (!config.highlight) {
				config.exec && SEEX(self.makepath(config.exec), opt.items[index], el);
				return;
			}

			if (config.multiple) {
				if (is) {
					if (config.unhighlight) {
						el.rclass(cls + '-selected');
						config.detail && self.row_detail(el);
						opt.selected = opt.selected.remove(index);
						config.exec && SEEX(self.makepath(config.exec), self.selected(), el);
					}
				} else {
					el.aclass(cls + '-selected');
					config.exec && SEEX(self.makepath(config.exec), self.selected(), el);
					config.detail && self.row_detail(el);
					opt.selected.push(index);
				}
			} else {

				if (is && !config.unhighlight)
					return;

				if (opt.selrow) {
					opt.selrow.rclass(cls + '-selected');
					config.detail && self.row_detail(opt.selrow);
					opt.selrow = null;
					opt.selindex = -1;
				}

				// Was selected
				if (is) {
					config.exec && SEEX(self.makepath(config.exec));
					return;
				}

				opt.selindex = index;
				opt.selrow = el;
				el.aclass(cls + '-selected');
				config.exec && SEEX(self.makepath(config.exec), opt.items[index], el);
				config.detail && self.row_detail(el);
			}
		};

		ebody.on('click', '> tr', function(e) {

			var el = $(this);
			var node = e.target;

			if (blacklist[node.tagName] || (node.tagName === 'SPAN' && node.getAttribute('class') || '').indexOf('link') !== -1)
				return;

			if (node.tagName === 'I') {
				var parent = $(node).parent();
				if (blacklist[parent[0].tagName] || (parent[0].tagName === 'SPAN' && parent.hclass('link')))
					return;
			}

			var now = Date.now();
			var isdblclick = dblclick ? (now - dblclick) < 250 : false;
			dblclick = now;

			var index = +el.attrd('index');
			if (index > -1) {

				var is = el.hclass(cls + '-selected');

				if (isdblclick && config.dblclick && is) {
					self.forceselectid && clearTimeout(self.forceselectid);
					SEEX(self.makepath(config.dblclick), opt.items[index], el);
					return;
				}

				self.forceselectid && clearTimeout(self.forceselectid);
				self.forceselectid = setTimeout(forceselect, config.dblclick ? is ? 250 : 1 : 1, el, index, is);
			}
		});

		var resize = function() {
			setTimeout2(self.ID, self.resize, 500);
		};

		$(W).on('resize', resize);
	};

	self.resize2 = function() {
		self.scrollbar && setTimeout2(self.ID + 'scrollbar', self.scrollbar.resize, 300);
	};

	self.resize = function() {

		var display = WIDTH();
		if (display !== opt.display && sizes[display] && sizes[display] !== sizes[opt.display]) {
			self.refresh();
			return;
		}

		if (config.height > 0)
			self.find(cls2 + '-container').css('height', config.height - config.margin);
		else if (config.height) {
			var el = self.parent(config.height);
			var header = self.find(cls2 + '-head');
			var footer = config.paginate ? (self.find(cls2 + '-footer').height() + 2) : 0;
			self.find(cls2 + '-container').css('height', el.height() - header.height() - footer - 2 - config.margin);
		}

		self.scrollbar && self.scrollbar.resize();
	};

	self.row_detail = function(el) {

		var index = +el.attrd('index');
		var row = opt.items[index];
		var eld = el.next();

		if (el.hclass(cls + '-selected')) {

			// Row is selected
			if (eld.hclass(cls + '-detail')) {
				// Detail exists
				eld.rclass('hidden');
			} else {

				// Detail doesn't exist
				el.after('<tr class="{0}-detail"><td colspan="{1}" data-index="{2}"></td></tr>'.format(cls, el.find('td').length, index));
				eld = el.next();

				var tmp;

				if (config.detail === true) {
					tmp = eld.find('td');
					tmp.html(templates.detail(row, { index: index, user: window.user, data: extradata }));
					dcompile && COMPILE(tmp);
				} else {
					tmp = eld.find('td');
					EXEC(self.makepath(config.detail), row, function(row) {
						var is = typeof(row) === 'string';
						tmp.html(is ? row : templates.detail(row, { index: index, user: window.user, data: extradata }));
						if ((is && row.COMPILABLE()) || dcompile)
							COMPILE(tmp);
					}, tmp);
				}
			}

		} else
			eld.hclass(cls + '-detail') && eld.aclass('hidden');

		self.resize2();
	};

	self.redrawrow = function(index, row) {

		if (typeof(index) === 'number')
			index = ebody.find('tr[data-index="{0}"]'.format(index));

		if (index.length) {
			var template = templates[opt.display];
			var indexer = {};
			indexer.data = extradata;
			indexer.user = W.user;
			indexer.index = +index.attrd('index');
			var is = index.hclass(cls + '-selected');
			var next = index.next();
			index.replaceWith(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
			next.hclass(cls + '-detail') && next.remove();
			is && ebody.find('tr[data-index="{0}"]'.format(indexer.index)).trigger('click');
		}
	};

	self.appendrow = function(row) {

		var index = opt.items.indexOf(row);
		if (index == -1)
			index = opt.items.push(row) - 1;

		var template = templates[opt.display];
		var indexer = {};
		indexer.data = extradata;
		indexer.user = W.user;
		indexer.index = index;
		ebody.append(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
	};

	self.removerow = function(row) {
		var index = opt.items.indexOf(row);
		if (index == -1)
			return;
		opt.selected = opt.selected.remove(index);
		opt.items.remove(row);
	};

	self.redraw = function() {
		var clsh = 'hidden';
		var count = 0;
		var indexer = { user: W.user, data: extradata };
		var builder = [];
		var template = templates[WIDTH()];
		if (template) {
			for (var i = 0; i < opt.items.length; i++) {
				var item = opt.items[i];
				count++;
				indexer.index = i;
				builder.push(template(item, indexer).replace('<tr', '<tr data-index="' + i + '"'));
			}
		}
		count && ebody.html(builder.join(''));
		eempty.tclass(clsh, count > 0);
		etable.tclass(clsh, count == 0);
		config.redraw && EXEC(self.makepath(config.redraw), self);
	};

	self.redrawpagination = function() {

		if (!config.paginate)
			return;

		var value = self.get();
		efooter.find('button').each(function() {

			var el = $(this);
			var dis = true;

			switch (this.name) {
				case 'page-next':
					dis = value.page >= value.pages;
					break;
				case 'page-prev':
					dis = value.page === 1;
					break;
				case 'page-last':
					dis = !value.pages || value.page === value.pages;
					break;
				case 'page-first':
					dis = value.page === 1;
					break;
			}

			el.prop('disabled', dis);
		});

		efooter.find('input')[0].value = value.page;
		efooter.find(cls2 + '-pagination-pages')[0].innerHTML = value.pages.pluralize.apply(value.pages, config.pluralizepages);
		efooter.find(cls2 + '-pagination-items')[0].innerHTML = value.count.pluralize.apply(value.count, config.pluralizeitems);
	};

	self.selected = function() {
		var rows = [];
		for (var i = 0; i < opt.selected.length; i++) {
			var row = opt.items[opt.selected[i]];
			row && rows.push(row);
		}
		return rows;
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'pluralizepages':
				config.pluralizepages = value.split(',').trim();
				break;
			case 'pluralizeitems':
				config.pluralizeitems = value.split(',').trim();
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
			case 'paginate':
			case 'exec':
			case 'click':
			case 'filter':
			case 'redraw':
				if (value && value.SCOPE)
					config[key] = value.SCOPE(self, value);
				break;
		}
	};

	self.bind = function(path, val) {
		extradata = val;
	};

	self.setter = function(value) {

		if (config.paginate && value == null) {
			var model = {};
			model.page = 1;
			if (prevsort)
				model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';
			EXEC(self.makepath(config.paginate), model);
			return;
		}

		var data = value ? value.items ? value.items : value : value;
		var empty = !data || !data.length;
		var clsh = 'hidden';

		if (!self.isinit) {
			self.rclass('invisible', 10);
			self.isinit = true;
		}

		var display = WIDTH();
		var builder = [];
		var buildersize = [];
		var selected = opt.selected.slice(0);

		for (var i = 0; i < selected.length; i++) {
			var row = opt.items[selected[i]];
			selected[i] = row[config.pk];
		}

		var size = sizes[display];
		var name = names[display];
		var align = aligns[display];
		var sort = sorts[display];

		if (prevhead !== display) {
			if ((size && size.length) || (name && name.length) || (align && align.length)) {

				var arr = name || size || align;

				for (var i = 0; i < arr.length; i++) {
					var w = !size || size[i] === '0' ? 'auto' : size[i];
					builder.push('<th style="width:{0};text-align:{2}"{3}>{1}</th>'.format(w, (sort && sort[i] ? '<i class="fa"></i>' : '') + (name ? name[i] : ''), align ? align[i] : 'left', sort && sort[i] ? ' class="sort"' : ''));
					buildersize.push('<th style="width:{0}"></th>'.format(w));
				}

				ehead.parent().tclass('hidden', !name);
				ehead.html('<tr>{0}</tr>'.format(builder.join('')));
				eheadsize.html('<tr>{0}</tr>'.format(buildersize.join('')));

			} else
				ehead.html('');

			prevsort = null;
			prevhead = display;
		}

		setTimeout(self.resize, 100);

		opt.display = display;
		opt.items = data ? data.slice(0) : 0;
		opt.data = value;
		opt.selindex = -1;
		opt.selrow = null;
		opt.selected = [];
		opt.sort = prevsort;

		self.redrawpagination();
		config.filter && EXEC(self.makepath(config.filter), opt, 'refresh');
		config.exec && SEEX(self.makepath(config.exec), config.multiple ? [] : null);

		if (empty) {
			etable.aclass(clsh);
			eempty.rclass(clsh);
			return;
		}

		self.redraw();

		if (config.remember) {
			for (var i = 0; i < selected.length; i++) {
				if (selected[i]) {
					var index = opt.items.findIndex(config.pk, selected[i]);
					if (index !== -1)
						ebody.find('tr[data-index="{0}"]'.format(index)).trigger('click');
				}
			}
		}
	};

});

// Component: Tangular-FileSize
// Version: 1
// Updated: 2018-11-03 22:40
Thelpers.filesize=function(value,decimals,type){return value?value.filesize(decimals,type):'...'};Number.prototype.filesize=function(decimals,type){if(typeof(decimals)==='string'){var tmp=type;type=decimals;decimals=tmp}var value,t=this;switch(type){case'bytes':value=t;break;case'KB':value=t/1024;break;case'MB':value=filesizehelper(t,2);break;case'GB':value=filesizehelper(t,3);break;case'TB':value=filesizehelper(t,4);break;default:type='bytes';value=t;if(value>1023){value=value/1024;type='KB'}if(value>1023){value=value/1024;type='MB'}if(value>1023){value=value/1024;type='GB'}if(value>1023){value=value/1024;type='TB'}break}type=' '+type;return(decimals===undefined?value.format(2).replace('.00',''):value.format(decimals))+type};function filesizehelper(number,count){while(count--){number=number/1024;if(number.toFixed(3)==='0.000')return 0}return number}
// End: Tangular-FileSize