var common = {};

FUNC.formatjson = function(obj) {
	var reguid2 = /"\d{14,}[a-z]{3}[01]{1}|"\d{9,14}[a-z]{2}[01]{1}a|"\d{4,18}[a-z]{2}\d{1}[01]{1}b|"[0-9a-f]{4,18}[a-z]{2}\d{1}[01]{1}c"/g;
	return '<pre>' + JSON.stringify(obj, null, '\t').replace(/\t.*?\:\s/g, function(text) {
		return '<span class="doc-object">' + text + '</span>';
	}).replace(/\/span>false/g, function() {
		return '/span><span class="doc-string">false</span>';
	}).replace(/\/span>null/g, function() {
		return '/span><span class="doc-null">null</span>';
	}).replace(reguid2, function(text) {
		return '<span class="doc-uid">' + text + '</span>';
	}) + '</pre>';
};

(function() {

	var RANDOM_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	var RANDOM_NUMBER = '0123456789';

	var random_string = function(max) {
		var builder = '';
		for (var i = 0; i < max; i++) {
			var index = Math.floor(Math.random() * RANDOM_STRING.length);
			builder += RANDOM_STRING[index];
		}
		return builder;
	};

	var random_number = function (max) {
		var builder = '';
		for (var i = 0; i < max; i++) {
			var index = Math.floor(Math.random() * RANDOM_NUMBER.length);
			if (!i && !index)
				index++;
			builder += RANDOM_NUMBER[index];
		}
		return builder;
	};

	var randomnumber = function(max, min) {
		max = (max || 100000);
		min = (min || 0);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	var randomitem = function(arr) {
		return arr[randomnumber(arr.length - 1)];
	};

	var capitalize = function(str, first) {

		if (first)
			return (str.charAt(0) || '').toUpperCase() + str.substring(1);

		var builder = '';
		var c;

		for (var i = 0, length = str.length; i < length; i++) {
			var c = str[i - 1];
			if (!c || (c === ' ' || c === '\t' || c === '\n'))
				c = str.charAt(i).toUpperCase();
			else
				c = str.charAt(i);
			builder += c;
		}

		return builder;
	};


	FUNC.makefakename = function(name) {

		var value = '';

		if (name === 'firstname' || name === 'givenname' || name === 'nick' || name === 'alias' || name === 'fullname')
			value = randomitem(['Peter', 'Joseph', 'James', 'Lena', 'Thomas', 'Lucy', 'Jakob']);

		if (name === 'middlename' || name === 'fullname')
			value = (value ? (value + ' ') : '') + randomitem(['Theodora', 'Benito', 'Carlene', 'Simpson', 'Alannah', 'Keith']);

		if (name === 'lastname' || name === 'surname' || name === 'fullname')
			value = (value ? (value + ' ') : '') + randomitem(['Walker', 'Parker', 'Taylor', 'Turner', 'Miller', 'Cooper']);

		if (name === 'company' || name === 'organization')
			value = randomitem(['Total Avengers', 'Google', 'Microsoft', 'Apple', 'Samsung', 'Eset']);

		if (name === 'languageid' || name === 'language')
			value = randomitem(['en', 'de', 'sk', 'fr', 'ru', 'es']);

		if (name === 'countryid' || name === 'country')
			value = randomitem(['SVK', 'USA', 'FRA', 'GBR', 'ESP', 'RUS']);

		if (name === 'currencyid' || name === 'currency')
			value = randomitem(['EUR', 'USD', 'GBP', 'RUB', 'CHF', 'LYD']);

		return value;
	};

	FUNC.makefake = function(type, max, name) {

		if (max > 30)
			max = 30;
		else if (!max)
			max = 10;

		if (name === 'email' || name === 'mail')
			type = 'email';

		switch (type) {
			case 'email':
				return (random_string(10) + '@' + random_string(8) + '.com').toLowerCase();
			case 'phone':
				return '+421' + random_number(9);
			case 'zip':
				return random_number(5);
			case 'number':
				if (name === 'age')
					return U.random(50, 18);
				return randomnumber(100);
			case 'float':
				return randomnumber(100) * (randomnumber(20, 2) / 100);
			case 'name':
				return capitalize(FUNC.makefakename(name) || ((random_string(6) + ' ' + random_string(10)).toLowerCase()));
			case 'lowercase':
				return random_string(max).toLowerCase();
			case 'uppercase':
				return random_string(max).toUpperCase();
			case 'capitalize':
			case 'capitalize2':
				return capitalize(FUNC.makefakename(name) || random_string(max).toLowerCase());
			case 'url':
				return 'https://' + random_string(10).toLowerCase() + '.com';
			case 'json':
				return '{"{0}":{1},"{2}":"{3}"}'.format(random_string(5).toLowerCase(), randomnumber(1000, 1), random_string(5), random_string(10));
			case 'string':
				return FUNC.makefakename(name) || random_string(max ? (max / 2) : 12);
			case 'base64':
				return btoa(GUID(10));
			case 'uid':
				return 'b5jp002tg40d';
			case 'uid16':
				return '7f0d5001tg51c';
			case 'date':
				var dt = new Date().add('-' + randomnumber(30) + ' days');
				if (name === 'dtbirth' || name === 'birthdate')
					dt.setFullYear(randomnumber(2000, 1970));
				return dt;
			case 'boolean':
				return randomnumber(10) % 2 === 0;
			case 'object':
				var tmp = {};
				tmp[random_string(5).toLowerCase()] = random_number(10);
				return tmp;
		}
	};
})();

COMPONENT('markdown', function (self) {

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
				icons.eq(0).tclass('fa-unlock', !is).tclass('fa-lock', is);
				icons.eq(1).tclass('fa-angle-up', !is).tclass('fa-angle-down', is);
			} else {
				icons.eq(0).tclass('fa-minus', !is).tclass('fa-plus', is);
				el.tclass('markdown-showblock-visible', !is);
			}
			el.find('b').html(el.attrd(is ? 'show' : 'hide'));
		});
	};

	/*! Markdown | (c) 2019 Peter Sirka | www.petersirka.com */
	(function Markdown() {

		var keywords = /(^|\s)\{.*?\}\(.*?\)/g;
		var linksexternal = /(https|http):\/\//;
		var format = /__.*?__|_.*?_|\*\*.*?\*\*|\*.*?\*|~~.*?~~|~.*?~/g;
		var ordered = /^[a-z|0-9]{1}\.\s|^-\s/i;
		var orderedsize = /^(\s|\t)+/;
		var code = /`.*?`/g;
		var encodetags = /<|>/g;
		var regdash = /-{2,}/g;
		var regicons = /(^|[^\w]):((fab\s|far\s|fas\s|fal\s|fad|fa\s)fa-)?[a-z-]+:([^\w]|$)/g;
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

			if ((/^#\d+$/).test(link)) {
				// footnotes
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
			return '<a href="' + (value.indexOf('@') !== -1 ? 'mailto:' : linksexternal.test(value) ? '' : 'http://') + value + '" target="_blank">' + value + '</a>';
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
				icon = 'fa fa-' + icon;
			return value.substring(0, beg - 1) + '<i class="' + icon + '"></i>' + value.substring(end + 1);
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

			if (!opt)
				opt = EMPTYOBJECT;

			el.find('.lang-secret').each(function() {
				var el = $(this);
				el.parent().replaceWith('<div class="markdown-secret" data-show="{0}" data-hide="{1}"><span class="markdown-showsecret"><i class="fa fa-lock"></i><i class="fa pull-right fa-angle-down"></i><b>{0}</b></span><div class="hidden">'.format(opt.showsecret || 'Show secret data', opt.hidesecret || 'Hide secret data') + el.html().trim().markdown(opt.secretoptions, true) +'</div></div>');
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
				t.$mdloaded = 1;
				hljs.highlightBlock(block);
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
					var text = el.html();
					if (text.substring(0, 1) === '<')
						beg = '-';
					if (text.substring(text.length - 1) === '>')
						end = '-';
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
				var n;

				for (var i = index; i < val.length; i++) {
					var c = val.charAt(i);

					if (c === '[') {
						beg = i;
						can = false;
						continue;
					}

					var il = val.substring(i, i + 4);

					if (il === '&lt;') {
						beg2 = i;
						continue;
					} else if (beg2 > -1 && il === '&gt;') {
						if (val.substring(beg2 - 6, beg2) !== '<code>')
							callback(val.substring(beg2, i + 4), true);
						beg2 = -1;
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
						callback(val.substring(beg - (n === '!' ? 1 : 0), i + 1));
						can = false;
						beg = -1;
					}
				}

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

			for (var i = 0, length = lines.length; i < length; i++) {

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
							line = line.replace(format, markdown_format).replace(keywords, markdown_keywords).replace(code, markdown_code);
						builder.push('<div class="markdown-block"><span class="markdown-showblock"><i class="fa fa-plus"></i>{0}</span><div class="hidden">'.format(line));
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

				if (line.length > 10 && opt.urlify !== false && opt.links !== false)
					line = markdown_urlify(line);

				if (opt.custom)
					line = opt.custom(line);

				if (line.length > 2 && line !== '***' && line !== '---') {
					if (opt.formatting !== false)
						line = line.replace(format, markdown_format).replace(code, markdown_code);
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
					if (opt.br !== false)
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

					builder.push('<li>' + tmpstr.trim().replace(/\[x\]/g, '<i class="fa fa-check-square green"></i>').replace(/\[\s\]/g, '<i class="far fa-square"></i>') + '</li>');

				} else {
					closeul();
					line && builder.push((opt.linetag ? ('<' + opt.linetag + '>') : '') + line.trim() + (opt.linetag ? ('</' + opt.linetag + '>') : ''));
					prev = 'p';
				}
			}

			closeul();
			table && opt.tables !== false && builder.push('</tbody></table>');
			iscode && opt.code !== false && builder.push('</code></pre>');
			return (opt.wrap ? ('<div class="markdown' + (nested ? '' : ' markdown-container') + '">') : '') + builder.join('\n').replace(/\t/g, '    ') + (opt.wrap ? '</div>' : '');
		};

	})();

});

COMPONENT('backtotop', function(self, config, cls) {

	var height = 0;
	var visible = false;

	self.singleton();
	self.nocompile();

	self.make = function() {

		var $w = $(W);

		self.aclass(cls);
		self.html('<span><i class="fa fa-arrow-circle-up"></i></span>');

		self.event('click', function() {
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
		});

		height = $w.height();

		$w.on('resize', function() {
			height = $w.height();
		});

		$w.on('scroll', function() {
			setTimeout2(self.id, function() {
				var position = $w.scrollTop();
				if (position > height) {
					if (visible)
						return;
					visible = true;
				} else {
					if (!visible)
						return;
					visible = false;
				}
				self.tclass('active', visible);
			}, 200);
		});
	};
});

$(document).on('click', 'h1,h2,h3,h4,h5', function() {
	var id = $(this).attr('id');
	if (id)
		location.hash = id;
});

function searchtext(val) {
	$('.search > i').tclass('fa-search', !val).tclass('fa-times red', !!val);
	val = val.toSearch();
	$('#headlines').find('a').each(function() {
		var t = this;
		var el = $(this);

		if (val)
			el.tclass('hidden', (t.$search || '').indexOf(val) === -1);
		else
			el.rclass('hidden');

	}).closest('.ui-viewbox').component().resizescrollbar();
}

function refresh_meta() {

	var el = $('#markdown');
	var arr = el.find('h1,h2,h3,h4,h5,p,li');
	var sum = 0;
	for (var i = 0; i < arr.length; i++) {
		var text = $(arr[i]).text();
		var words = text.split(' ');
		for (var j = 0; j < words.length; j++) {
			var word = words[j];
			sum += (word.length * 0.650) / 10; // Reading time for 10 characters word is 450 ms
		}
	}

	var time = (sum / 60) >> 0;
	var builder = [];
	el.find('h2,h3,h4').each(function() {
		var dom = this;
		var el = $(dom);
		builder.push('<a href="#{0}" class="{1}">{2}</a>'.format(el.attr('id'), dom.tagName, (dom.tagName === 'H2' ? '<i class="far fa-angle-right"></i>' : '') + el.text().trim()));
	});

	var title = el.find('h1,h2').eq(0).text();
	if (title)
		document.title = title;

	var keywords = {};
	var current;

	el.find('h2,h3,h4,h5,p,li').each(function() {
		var t = this;
		var el = $(this);

		switch (t.tagName) {
			case 'H2':
			case 'H3':
			case 'H4':
				current = el.attr('id');
				break;
		}

		if (!current)
			return;

		var content = el.text().replace(/\n|\t/g, '').toSearch();
		if (keywords[current])
			keywords[current] += ' ' + content;
		else
			keywords[current] = content;
	});

	$('#headlines').html(builder.join(''));
	$('#readingtime').find('span').html(time + ' min.');
	$('.panel').rclass('invisible');

	$('#headlines').find('a').each(function() {
		var t = this;
		var el = $(t);
		t.$search = keywords[el.attr('href').substring(1)];
	});
}

function refresh_body(md) {
	var index = md.indexOf('<');
	if (index !== -1) {
		common.url = md.substring(index + 1, md.indexOf('>'));
		common.id = common.url.replace(/[-:_\.\/\\]/g, '');
	}
}

ON('ready', function() {

	var search = function(input) {
		searchtext(input.value);
	};

	var input = $('#search').on('input', function() {
		setTimeout2('search', search, 500, null, this);
	});

	if (!isMOBILE) {
		setTimeout(function() {
			input.focus();
		}, 800);
	}

	$('.search > i').on('click', function() {
		if ($(this).hclass('fa-times')) {
			$('#search').val('');
			searchtext('');
		}
	});

	$(document).on('click', 'a', function() {
		var el = $(this);
		var href = el.attr('href');
		if (href.substring(0, 5) === '#api_') {
			var obj = PARSE(decodeURIComponent(atob(href.substring(5))));
			SET('requestform', obj);
			SET('common.form', 'requestform');
		}
	});

	var md = $('#markdown');
	var scr = md.find('scri' + 'pt');
	if (scr.length) {
		var body = scr.html();
		refresh_body(body);
		md.html(body.markdown());
		FUNC.markdownredraw($('body'));
		refresh_meta();
		document.title = $('h1').text();
		return;
	}

	AJAX('GET ' + (NAV.query.url || W.filename), function(response) {
		if (response) {
			refresh_body(response);
			$('#markdown').html(response.markdown());
			FUNC.markdownredraw($('body'));
			refresh_meta();
			document.title = $('h1').text();
		}
	});
});

COMPONENT('viewbox','margin:0;scroll:true;delay:100;scrollbar:0;visibleY:1;height:100;invisible:1',function(self,config,cls){var eld,elb,scrollbar,cls2='.'+cls,init=false,cache;self.readonly();self.init=function(){var resize=function(){for(var i=0;i<M.components.length;i++){var com=M.components[i];if(com.name==='viewbox'&&com.dom.offsetParent&&com.$ready&&!com.$removed)com.resizeforce()}};ON('resize2',function(){setTimeout2('viewboxresize',resize,200)})};self.destroy=function(){scrollbar&&scrollbar.destroy()};self.configure=function(key,value,init){switch(key){case'disabled':eld.tclass('hidden',!value);break;case'minheight':case'margin':case'marginxs':case'marginsm':case'marginmd':case'marginlg':!init&&self.resize();break;case'selector':config.parent=value;self.resize();break}};self.scrollbottom=function(val){if(val==null)return elb[0].scrollTop;elb[0].scrollTop=(elb[0].scrollHeight-self.dom.clientHeight)-(val||0);return elb[0].scrollTop};self.scrolltop=function(val){if(val==null)return elb[0].scrollTop;elb[0].scrollTop=(val||0);return elb[0].scrollTop};self.make=function(){config.invisible&&self.aclass('invisible');config.scroll&&MAIN.version>17&&self.element.wrapInner('<div class="'+cls+'-body"></div>');self.element.prepend('<div class="'+cls+'-disabled hidden"></div>');eld=self.find('> .{0}-disabled'.format(cls)).eq(0);elb=self.find('> .{0}-body'.format(cls)).eq(0);self.aclass('{0} {0}-hidden'.format(cls));if(config.scroll){if(config.scrollbar){if(MAIN.version>17){scrollbar=W.SCROLLBAR(self.find(cls2+'-body'),{shadow:config.scrollbarshadow,visibleY:config.visibleY,visibleX:config.visibleX,orientation:config.visibleX?null:'y',parent:self.element});self.scrolltop=scrollbar.scrollTop;self.scrollbottom=scrollbar.scrollBottom}else self.aclass(cls+'-scroll')}else{self.aclass(cls+'-scroll');self.find(cls2+'-body').aclass('noscrollbar')}}self.resize()};self.released=function(is){!is&&self.resize()};var css={};self.resize=function(scrollto){setTimeout2(self.ID,self.resizeforce,200,null,scrollto)};self.resizeforce=function(scrollto){var el=self.parent(config.parent);var h=el.height();var w=el.width();var width=WIDTH();var mywidth=self.element.width();var key=width+'x'+mywidth+'x'+w+'x'+h;if(cache===key){scrollbar&&scrollbar.resize();if(scrollto){if(scrollto==='bottom')self.scrollbottom(0);else self.scrolltop(0)}return}cache=key;var margin=config.margin,responsivemargin=config['margin'+width];if(responsivemargin!=null)margin=responsivemargin;if(margin==='auto')margin=self.element.offset().top;if(h===0||w===0){self.$waiting&&clearTimeout(self.$waiting);self.$waiting=setTimeout(self.resize,234);return}h=((h/100)*config.height)-margin;if(config.minheight&&h<config.minheight)h=config.minheight;css.height=h;css.width=mywidth;eld.css(css);css.width=null;self.css(css);elb.length&&elb.css(css);self.element.SETTER('*','resize');var c=cls+'-hidden';self.hclass(c)&&self.rclass(c,100);scrollbar&&scrollbar.resize();if(scrollto){if(scrollto==='bottom')self.scrollbottom(0);else self.scrolltop(0)}if(!init){self.rclass('invisible',250);init=true}};self.resizescrollbar=function(){scrollbar&&scrollbar.resize()};self.setter=function(){setTimeout(self.resize,config.delay,config.scrollto||config.scrolltop)}});
COMPONENT('largeform','zindex:12;padding:30;scrollbar:1;scrolltop:1;style:1',function(self,config,cls){var cls2='.'+cls,csspos={},nav=false,init=false;if(!W.$$largeform){W.$$largeform_level=W.$$largeform_level||1;W.$$largeform=true;$(document).on('click',cls2+'-button-close',function(){SET($(this).attrd('path'),'')});var resize=function(){setTimeout2(self.name,function(){for(var i=0;i<M.components.length;i++){var com=M.components[i];if(com.name==='largeform'&&!HIDDEN(com.dom)&&com.$ready&&!com.$removed)com.resize()}},200)};ON('resize2',resize);$(document).on('click',cls2+'-container',function(e){if(e.target===this){var com=$(this).component();if(com&&com.config.closeoutside){com.set('');return}}var el=$(e.target);if(el.hclass(cls+'-container')&&!el.hclass(cls+'-style-2')){var form=el.find(cls2);var c=cls+'-animate-click';form.aclass(c);setTimeout(function(){form.rclass(c)},300)}})}self.readonly();self.submit=function(){if(config.submit)self.EXEC(config.submit,self.hide,self.element);else self.hide()};self.cancel=function(){config.cancel&&self.EXEC(config.cancel,self.hide);self.hide()};self.hide=function(){if(config.independent)self.hideforce();self.esc(false);self.set('')};self.icon=function(value){var el=this.rclass2('fa');value.icon&&el.aclass(value.icon.indexOf(' ')===-1?('fa fa-'+value.icon):value.icon)};self.resize=function(){if(self.hclass('hidden'))return;var padding=isMOBILE?0:config.padding,ui=self.find(cls2);csspos.height=WH-(config.style==1?(padding*2):padding);csspos.top=padding;ui.css(csspos);var el=self.find(cls2+'-title');var th=el.height();var w=ui.width();if(w>WW)w=WW;csspos={height:csspos.height-th,width:w};if(nav)csspos.height-=nav.height();self.find(cls2+'-body').css(csspos);self.scrollbar&&self.scrollbar.resize();self.element.SETTER('*','resize')};self.make=function(){$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div><div class="{4}-body"></div></div>'.format(self.ID,config.width||800,self.path,config.closebutton==false?' hidden':'',cls));var scr=self.find('> script');self.template=scr.length?scr.html().trim():'';scr.length&&scr.remove();var el=$('#'+self.ID);var body=el.find(cls2+'-body')[0];while(self.dom.children.length){var child=self.dom.children[0];if(child.tagName==='NAV'){nav=$(child);body.parentNode.appendChild(child)}else body.appendChild(child)}self.rclass('hidden invisible');self.replace(el,true);if(config.scrollbar)self.scrollbar=SCROLLBAR(self.find(cls2+'-body'),{visibleY:config.visibleY,orientation:'y'});if(config.style===2)self.aclass(cls+'-style-2');self.event('scroll',function(){EMIT('scroll',self.name);EMIT('reflow',self.name)});self.event('click','button[name]',function(){var t=this;switch(t.name){case'submit':self.submit(self.hide);break;case'cancel':!t.disabled&&self[t.name](self.hide);break}});config.enter&&self.event('keydown','input',function(e){e.which===13&&!self.find('button[name="submit"]')[0].disabled&&setTimeout(self.submit,800)})};self.configure=function(key,value,init,prev){if(!init){switch(key){case'width':value!==prev&&self.find(cls2).css('max-width',value+'px');break;case'closebutton':self.find(cls2+'-button-close').tclass('hidden',value!==true);break}}};self.esc=function(bind){if(bind){if(!self.$esc){self.$esc=true;$(W).on('keydown',self.esc_keydown)}}else{if(self.$esc){self.$esc=false;$(W).off('keydown',self.esc_keydown)}}};self.esc_keydown=function(e){if(e.which===27&&!e.isPropagationStopped()){var val=self.get();if(!val||config.if===val){e.preventDefault();e.stopPropagation();self.hide()}}};self.hideforce=function(){if(!self.hclass('hidden')){self.aclass('hidden');self.release(true);self.find(cls2).rclass(cls+'-animate');W.$$largeform_level--}};var allowscrollbars=function(){$('html').tclass(cls+'-noscroll',!!$(cls2+'-container').not('.hidden').length)};self.setter=function(value){setTimeout2(self.name+'-noscroll',allowscrollbars,50);var isHidden=value!==config.if;if(self.hclass('hidden')===isHidden){if(!isHidden){config.reload&&self.EXEC(config.reload,self);config.default&&DEFAULT(self.makepath(config.default),true);config.scrolltop&&self.scrollbar&&self.scrollbar.scrollTop(0)}return}setTimeout2(cls,function(){EMIT('reflow',self.name)},10);if(isHidden){if(!config.independent)self.hideforce();return}if(self.template){var is=self.template.COMPILABLE();self.find(cls2).append(self.template);self.template=null;is&&COMPILE()}if(W.$$largeform_level<1)W.$$largeform_level=1;W.$$largeform_level++;self.css('z-index',W.$$largeform_level*config.zindex);self.rclass('hidden');self.release(false);config.scrolltop&&self.scrollbar&&self.scrollbar.scrollTop(0);config.reload&&self.EXEC(config.reload,self);config.default&&DEFAULT(self.makepath(config.default),true);if(!isMOBILE&&config.autofocus){setTimeout(function(){self.find(typeof(config.autofocus)==='string'?config.autofocus:'input[type="text"],select,textarea').eq(0).focus()},1000)}self.resize();setTimeout(function(){self.rclass('invisible');self.find(cls2).aclass(cls+'-animate');if(!init&&isMOBILE){$('body').aclass('hidden');setTimeout(function(){$('body').rclass('hidden')},50)}init=true},300);setTimeout2(self.ID,function(){self.css('z-index',(W.$$largeform_level*config.zindex)+1)},500);config.closeesc&&self.esc(true)}});
COMPONENT('importer',function(self,config){var init=false,clid=null,pending=false,content='';self.readonly();self.make=function(){var scr=self.find('script');content=scr.length?scr.html():''};self.reload=function(recompile){config.reload&&EXEC(config.reload);recompile&&COMPILE();setTimeout(function(){pending=false;init=true},1000)};self.setter=function(value){if(pending)return;if(config.if!==value){if(config.cleaner&&init&&!clid)clid=setTimeout(self.clean,config.cleaner*60000);return}pending=true;if(clid){clearTimeout(clid);clid=null}if(init){self.reload();return}if(content){self.html(content);setTimeout(self.reload,50,true)}else self.import(config.url,self.reload)};self.clean=function(){config.clean&&EXEC(config.clean);setTimeout(function(){self.empty();init=false;clid=null},1000)}});
COMPONENT('validation','delay:100;flags:visible',function(self,config,cls){var path,elements=null,def='button[name="submit"]',flags=null,tracked=false,reset=0,old,track;self.readonly();self.make=function(){elements=self.find(config.selector||def);path=self.path.replace(/\.\*$/,'')};self.configure=function(key,value,init){switch(key){case'selector':if(!init)elements=self.find(value||def);break;case'flags':if(value){flags=value.split(',');for(var i=0;i<flags.length;i++)flags[i]='@'+flags[i]}else flags=null;break;case'track':track=value.split(',').trim();break}};var settracked=function(){tracked=0};self.setter=function(value,path,type){var is=path===self.path||path.length<self.path.length;if(reset!==is){reset=is;self.tclass(cls+'-modified',!reset)}if((type===1||type===2)&&track&&track.length){for(var i=0;i<track.length;i++){if(path.indexOf(track[i])!==-1){tracked=1;return}}if(tracked===1){tracked=2;setTimeout(settracked,config.delay*3)}}};var check=function(){var disabled=tracked?!VALID(path,flags):DISABLED(path,flags);if(!disabled&&config.if)disabled=!EVALUATE(self.path,config.if);if(disabled!==old){elements.prop('disabled',disabled);self.tclass(cls+'-ok',!disabled);self.tclass(cls+'-no',disabled);old=disabled}};self.state=function(type,what){if(type===3||what===3)tracked=0;setTimeout2(self.ID,check,config.delay)}});
COMPONENT('properties2','datetimeformat:yyyy-MM-dd HH:mm;dateformat:yyyy-MM-dd;timeformat:HH:mm;modalalign:center;style:1;validation:1',function(self,config,cls){var cls2='.'+cls,container,types={},skip=false,values,funcs;self.nocompile();self.bindvisible();self.validate=function(value){if(config.validation&&value&&value.length){for(var i=0;i<value.length;i++){if(value[i].invalid)return false}}return true};self.make=function(){self.aclass(cls+(config.style===2?(' '+cls+'-2'):''));if(!$('#propertie2supload').length)$(document.body).append('<input type="file" id="properties2upload" />');self.append('<div><div class="{0}-container"></div></div>'.format(cls));container=self.find(cls2+'-container');var keys=Object.keys(types);for(var i=0;i<keys.length;i++){var key=keys[i];types[key].init&&types[key].init()}};self.finditem=function(el){var index=+$(el).closest(cls2+'-item').attrd('index');return index>=0?self.get()[index]:null};self.findel=function(el){return $(el).closest(cls2+'-item')};self.modifyval=function(item){values[item.name]=item.value;var items=self.get();for(var i=0;i<items.length;i++){var item=items[i];if(!item.show)continue;var is=funcs[item.name+'_show'](values);self.find(cls2+'-item[data-index="{0}"]'.format(i)).tclass('hidden',!is)}};self.register=function(name,init,render){types[name]={};types[name].init=init;types[name].render=render;init(self)};types.string={};types.string.init=function(){self.event('click',cls2+'-tstring',function(){var el=$(this);if(!el.hclass('ui-disabled'))el.find('input').focus()});self.event('change','.pstring',function(){var t=this,item=self.finditem(t);var val=t.value.trim();switch(item.transform){case'uppercase':val=val.toUpperCase();t.value=val;break;case'lowercase':val=val.toLowerCase();t.value=val;break;case'capitalize':var tmp=val.split(' ');for(var i=0;i<tmp.length;i++)tmp[i]=tmp[i].substring(0,1).toUpperCase()+tmp[i].substring(1);t.value=tmp.join(' ');break;case'slug':val=val.slug();break}var isvalid=item.required?!!val:true;if(isvalid){if(typeof(item.validate)==='object'){isvalid=item.validate.test(val)}else{switch(item.validate){case'email':isvalid=val.isEmail();break;case'phone':isvalid=val.isPhone();break;case'url':isvalid=val.isURL();break}}}var el=self.findel(t);if(isvalid){item.value=val;item.changed=item.prev!==val;el.tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item);self.modifyval(item)}self.change(true);item.invalid=!isvalid;el.tclass(cls+'-invalid',item.invalid);t.$processed=true;item.required&&self.validate2()})};types.string.render=function(item,next){next('<div class="{0}-string"><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pstring"{4} /></div>'.format(cls,item.maxlength,item.placeholder||'',Thelpers.encode(item.value),item.disabled?' disabled':''))};types.password={};types.password.init=function(){self.event('click',cls2+'-tpassword',function(){var el=$(this);if(!el.hclass('ui-disabled'))el.find('input').focus()});self.event('focus','.ppassword',function(){$(this).attr('type','text')});self.event('blur','.ppassword',function(){$(this).attr('type','password')});self.event('change','.ppassword',function(){var t=this,item=self.finditem(t);var val=t.value.trim();var isvalid=item.required?!!val:true;if(isvalid){if(typeof(item.validate)==='object')isvalid=item.validate.test(val)}var el=self.findel(t);if(isvalid){item.value=val;item.changed=item.prev!==val;el.tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item);self.modifyval(item)}item.invalid=!isvalid;el.tclass(cls+'-invalid',item.invalid);t.$processed=true;self.change(true);item.required&&self.validate2()})};types.password.render=function(item,next){next('<div class="{0}-string"><input type="password" maxlength="{1}" placeholder="{2}" value="{3}" class="ppassword"{4} /></div>'.format(cls,item.maxlength,item.placeholder||'',Thelpers.encode(item.value),item.disabled?' disabled':''))};types.number={};types.number.init=function(){self.event('click',cls2+'-tnumber',function(){var el=$(this);if(!el.hclass('ui-disabled'))el.find('input').focus()});self.event('blur change','.pnumber',function(){var t=this;if(t.$processed)return;var item=self.finditem(t);var val=t.value.trim();if(!val&&item.value==null)return;var el=self.findel(t);var isvalid=true;val=val.parseFloat();if(item.min!=null&&val<item.min)isvalid=false;else if(item.max!=null&&val>item.max)isvalid=false;item.invalid=!isvalid;if(isvalid){t.value=val+'';item.value=val;item.changed=item.prev!==val;el.tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item);self.modifyval(item)}el.tclass(cls+'-invalid',item.invalid);t.$processed=true;self.change(true);item.required&&self.validate2()});self.event('keydown','.pnumber',function(e){var t=this;t.$processed=false;if(e.which===38||e.which===40){var num=t.value.parseFloat();var item=self.finditem(t);if(e.which===38)num+=item.inc||1;else if(e.which===40)num-=item.inc||1;t.value=num;e.preventDefault()}})};types.number.render=function(item,next){next('<div class="{0}-number"><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pnumber"{4} /></div>'.format(cls,20,item.placeholder||'',Thelpers.encode((item.value==null?'':item.value)+''),item.disabled?' disabled':''))};types.date={};types.date.init=function(){self.event('click',cls2+'-tdate',function(){var el=$(this);if(!el.hclass('ui-disabled'))el.find('input').focus()});self.event('blur change','.pdate',function(e){var t=this;if(e.type==='change')SETTER('!datepicker','hide');if(t.$processed)return;var item=self.finditem(t);var val=t.value.parseDate(config.dateformat);item.value=val;item.changed=!item.prev||item.prev.format(config.dateformat)!==val.format(config.dateformat);self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){t.value=val});self.modifyval(item);self.change(true);item.required&&self.validate2();t.$processed=true});self.event('keydown','.pdate',function(e){var t=this;t.$processed=false;if((e.which===38||e.which===40)&&t.value){var val=t.value.parseDate(config.dateformat);var item=self.finditem(t);val=val.add((e.which===40?'-':'')+(item.inc||'1 day'));t.value=val.format(config.dateformat);e.preventDefault()}});self.event('click','.pdate',function(){var t=this,el=$(t);var opt={},item=self.finditem(t);opt.element=el.closest(cls2+'-date').find('input');opt.value=item.value;opt.callback=function(value){t.$processed=false;t.value=value.format(config.dateformat);el.trigger('change')};SETTER('datepicker','show',opt)})};types.date.render=function(item,next){next('<div class="{0}-date"><i class="fa fa-calendar pdate"></i><div><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pdate" /></div></div>'.format(cls,config.dateformat.length,item.placeholder||'',item.value?item.value.format(config.dateformat):''))};types.bool={};types.bool.init=function(){if(config.style===2){self.event('click',cls2+'-tbool',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-booltoggle').trigger('click')})}self.event('click',cls2+'-booltoggle',function(e){e.preventDefault();e.stopPropagation();var t=this,el=$(t);var item=self.finditem(t);if(item.disabled)return;el.tclass('checked');item.value=el.hclass('checked');item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item);self.modifyval(item);self.change(true);item.required&&self.validate2()})};types.bool.render=function(item,next){next('<div class="{0}-bool"><span class="{0}-booltoggle{1}"><i></i></span></div>'.format(cls,item.value?' checked':''))};types.exec={};types.exec.init=function(){self.event('click',cls2+'-'+(config.style===2?'t':'')+'exec',function(){var t=this,el=$(t);var item=self.finditem(t);if(!item.disabled&&item.exec)self.EXEC(item.exec,item,el)})};types.exec.render=function(item,next){next('<div class="{0}-exec">{1}<i class="fa fa-angle-right"></i></div>'.format(cls,item.value?Thelpers.encode(item.value):''))};types.text={};types.text.render=function(item,next){next('<div class="{0}-text">{1}</div>'.format(cls,item.value?Thelpers.encode(item.value):''))};types.list={};types.list.init=function(){if(config.style===2){self.event('click',cls2+'-tlist',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-list').trigger('click')})}self.event('click',cls2+'-list',function(e){e.preventDefault();e.stopPropagation();var t=this,item=self.finditem(t);if(item.disabled)return;var opt={};opt.offsetY=-5;opt.element=$(t);opt.items=typeof(item.items)==='string'?item.items.indexOf('/')===-1?GET(item.items):item.items:item.items;opt.custom=item.dircustom;opt.minwidth=80;if(item.dirsearch)opt.placeholder=item.dirsearch;else if(item.dirsearch==false)opt.search=false;opt.callback=function(value){if(typeof(value)==='string'){opt.element.find('span').text(value);item.value=value}else{opt.element.find('span').html(value[item.dirkey||'name']);item.value=value[item.dirvalue||'id']}if(item.dircustom&&item.dirappend!==false){if(!opt.items)opt.items=[];if(opt.items.indexOf(item.value)===-1)opt.items.push(item.value)}item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){opt.element.find('span').text(val)});self.modifyval(item);self.change(true);item.required&&self.validate2()};SETTER('directory','show',opt)})};types.list.render=function(item,next){var template='<div class="{0}-list">'+(config.style===2?'':'<i class="fa fa-chevron-down"></i>')+'<span>{1}</span></div>';if(item.detail){AJAX('GET '+item.detail.format(encodeURIComponent(item.value)),function(response){next(template.format(cls,response[item.dirkey||'name']||item.placeholder||DEF.empty))})}else{var arr=typeof(item.items)==='string'?GET(item.items):item.items;var m=(arr||EMPTYARRAY).findValue(item.dirvalue||'id',item.value,item.dirkey||'name',item.placeholder||DEF.empty);next(template.format(cls,m))}};types.menu={};types.menu.init=function(){if(config.style===2){self.event('click',cls2+'-tmenu',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-menu').trigger('click')})}self.event('click',cls2+'-menu',function(){var t=this,item=self.finditem(t);if(item.disabled)return;var opt={};if(config.style===2)opt.align='right';opt.offsetY=-5;opt.element=$(t);opt.items=typeof(item.items)==='string'?item.items.indexOf('/')===-1?GET(item.items):item.items:item.items;opt.callback=function(value){if(typeof(value)==='string'){opt.element.find('span').text(value);item.value=value}else{opt.element.find('span').html(value[item.dirkey||'name']);item.value=value[item.dirvalue||'id']}if(item.dircustom&&item.dirappend!==false){if(!opt.items)opt.items=[];if(opt.items.indexOf(item.value)===-1)opt.items.push(item.value)}item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){opt.element.find('span').text(val)});self.modifyval(item);self.change(true);item.required&&self.validate2()};SETTER('menu','show',opt)})};types.menu.render=function(item,next){var template='<div class="{0}-menu">'+(config.style===2?'':'<i class="fa fa-chevron-down"></i>')+'<span>{1}</span></div>';if(item.detail){AJAX('GET '+item.detail.format(encodeURIComponent(item.value)),function(response){next(template.format(cls,response[item.dirkey||'name']||item.placeholder||DEF.empty))})}else{var arr=typeof(item.items)==='string'?GET(item.items):item.items;var m=(arr||EMPTYARRAY).findValue(item.dirvalue||'id',item.value,item.dirkey||'name',item.placeholder||DEF.empty);next(template.format(cls,m))}};types.color={};types.color.init=function(){if(config.style===2){self.event('click',cls2+'-tcolor',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-colortoggle').trigger('click')})}self.event('click',cls2+'-colortoggle',function(e){e.preventDefault();e.stopPropagation();var t=this,item=self.finditem(t);if(item.disabled)return;var opt={};opt.align=config.modalalign;opt.element=$(t);opt.callback=function(value){opt.element.find('b').css('background-color',value);item.value=value;item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){opt.element.find('b').css('background-color',val)});self.modifyval(item);self.change(true);item.required&&self.validate2()};SETTER('colorpicker','show',opt)})};types.color.render=function(item,next){next('<div class="{0}-color"><span class="{0}-colortoggle"><b{1}>&nbsp;</b></span></div>'.format(cls,item.value?(' style="background-color:'+item.value+'"'):''))};types.fontawesome={};types.fontawesome.init=function(){if(config.style===2){self.event('click',cls2+'-tfontawesome',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-fontawesometoggle').trigger('click')})}self.event('click',cls2+'-fontawesometoggle',function(e){e.preventDefault();e.stopPropagation();var t=this,item=self.finditem(t);if(item.disabled)return;var opt={};opt.align=config.modalalign;opt.element=$(t);opt.callback=function(value){opt.element.find('i').rclass().aclass(value);item.value=value;item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){opt.element.find('i').rclass().aclass(val)});self.modifyval(item);self.change(true);item.required&&self.validate2()};SETTER('faicons','show',opt)})};types.fontawesome.render=function(item,next){next('<div class="{0}-fontawesome"><span class="{0}-fontawesometoggle"><i class="{1}"></i></span></div>'.format(cls,item.value||''))};types.emoji={};types.emoji.init=function(){if(config.style===2){self.event('click',cls2+'-temoji',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-emojitoggle').trigger('click')})}self.event('click',cls2+'-emojitoggle',function(e){e.preventDefault();e.stopPropagation();var t=this,item=self.finditem(t);if(item.disabled)return;var opt={};opt.align=config.modalalign;opt.element=$(t);opt.callback=function(value){opt.element.html(value);item.value=value;item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){opt.element.html(val)});self.modifyval(item);self.change(true);item.required&&self.validate2()};SETTER('emoji','show',opt)})};types.emoji.render=function(item,next){next('<div class="{0}-emoji"><span class="{0}-emojitoggle">{1}</span></div>'.format(cls,item.value||DEF.empty))};types.file={};types.file.init=function(){if(config.style===2){self.event('click',cls2+'-tfile',function(e){e.stopPropagation();e.preventDefault();$(this).find(cls2+'-file').trigger('click')})}self.event('click',cls2+'-file',function(e){e.preventDefault();e.stopPropagation();var t=this,item=self.finditem(t);if(item.disabled)return;var file=$('#propertiesupload');if(item.accept)file.attr('accept',item.accept);else file.removeAttr('accept');file.off('change').on('change',function(){var file=this,data=new FormData();data.append('file',file.files[0]);SETTER('loading','show');UPLOAD(item.url,data,function(response){item.value=response;item.changed=item.prev!==item.value;self.findel(t).tclass(cls+'-changed',item.changed);config.change&&self.EXEC(config.change,item,function(val){self.findel(cls2+'-filename').text(val)});SETTER('loading','hide',1000);file.value='';self.modifyval(item);self.change(true);item.required&&self.validate2()})}).trigger('click')})};types.file.render=function(item,next){next('<div class="{0}-file"><i class="far fa-folder"></i><span class="{0}-filename">{1}</span></div>'.format(cls,item.filename||item.value||DEF.empty))};self.render=function(item,index){var type=types[item.type==='boolean'?'bool':item.type],c=cls;if(item.show){if(!funcs[item.name+'_show'](values))c='hidden '+c}var meta={label:item.label,type:item.type};if(item.icon){var tmp=item.icon,color;tmp=tmp.replace(/#[a-f0-9]+/gi,function(text){color=text;return''}).trim();if(tmp.indexOf(' ')===-1)tmp='fa fa-'+tmp;meta.icon=Tangular.render('<i class="{{ icon}}"{{ if color}} style="{{ type}}color:{{ color}}"{{ fi}}></i>',{icon:tmp,color:color,type:config.style===2?'background-':''})}else meta.icon='';var el=$(('<div class="{2}-item{3} {2}-t{type}'+(item.required?' {2}-required':'')+(item.icon?' {2}-isicon':'')+(item.note?' {2}-isnote':'')+'" data-index="{1}">'+(config.style===2?'{{ icon}}<div>':'')+'<div class="{0}-key">'+(config.style===2?'':'{{ icon}}')+'{{ label}}</div>'+(config.style===2?'<div class="{0}-value">&nbsp;</div><div class="{0}-note">{1}</div>'.format(cls,Thelpers.encode(item.note)):'<div class="{0}-value">&nbsp;</div>')+'</div>'+(config.style===2?'</div>':'')).format(cls,index,c,item.required?(' '+cls+'-required'):'').arg(meta));type.render(item,function(html){if(item.note&&config.style!==2)html+='<div class="{0}-note">{1}</div>'.format(cls,item.note);el.find(cls2+'-value').html(html);item.disabled&&el.aclass('ui-disabled')},el);return el};self.setter=function(value){if(skip){skip=false;return}if(!value)value=EMPTYARRAY;container.empty();var groups={};values={};funcs={};for(var i=0;i<value.length;i++){var item=value[i],g=item.group||'Default';item.invalid=false;if(!groups[g])groups[g]={html:[]};switch(item.type){case'fontawesome':case'string':item.prev=item.value||'';break;case'date':item.prev=item.value?item.value.format(config.dateformat):null;break;default:item.prev=item.value;break}if(item.show)funcs[item.name+'_show']=typeof(item.show)==='string'?FN(item.show):item.show;values[item.name]=item.value;if(item.required)item.invalid=!item.value;groups[g].html.push(self.render(item,i))}var keys=Object.keys(groups);for(var i=0;i<keys.length;i++){var key=keys[i],group=groups[key],hash='g'+HASH(key,true);var el=$('<div class="{0}-group" data-id="{2}"><label>{1}</label><section></section></div>'.format(cls,key,hash));var section=el.find('section');for(var j=0;j<group.html.length;j++)section.append(group.html[j]);container.append(el)}self.validate2()}});
COMPONENT('loading',function(self,config,cls){var delay,prev;self.readonly();self.singleton();self.nocompile();self.make=function(){self.aclass(cls+' '+cls+'-'+(config.style||1));self.append('<div><div class="'+cls+'-text hellip"></div></div>')};self.show=function(text){clearTimeout(delay);if(prev!==text){prev=text;self.find('.'+cls+'-text').html(text||'')}self.rclass('hidden');return self};self.hide=function(timeout){clearTimeout(delay);delay=setTimeout(function(){self.aclass('hidden')},timeout||1);return self}});
COMPONENT('exec',function(self,config){var regparent=/\?\d/;self.readonly();self.blind();self.make=function(){var scope=null,scopepath=function(el,val){if(!scope)scope=el.scope();return val==null?scope:scope?scope.makepath?scope.makepath(val):val.replace(/\?/g,el.scope().path):val};var fn=function(plus){return function(e){var el=$(this);var attr=el.attrd('exec'+plus);var path=el.attrd('path'+plus);var href=el.attrd('href'+plus);var def=el.attrd('def'+plus);var reset=el.attrd('reset'+plus);scope=null;var prevent=el.attrd('prevent'+plus);if(prevent==='true'||prevent==='1'){e.preventDefault();e.stopPropagation()}if(attr){if(attr.indexOf('?')!==-1){var tmp=scopepath(el);if(tmp){var isparent=regparent.test(attr);attr=tmp.makepath?tmp.makepath(attr):attr.replace(/\?/g,tmp.path);if(isparent&&attr.indexOf('/')!==-1)M.scope(attr.split('/')[0]);else M.scope(tmp.path)}}EXEC(attr,el,e)}href&&NAV.redirect(href);if(def){if(def.indexOf('?')!==-1)def=scopepath(el,def);DEFAULT(def)}if(reset){if(reset.indexOf('?')!==-1)reset=scopepath(el,reset);RESET(reset)}if(path){var val=el.attrd('value');if(val){if(path.indexOf('?')!==-1)path=scopepath(el,path);var v=GET(path);SET(path,new Function('value','return '+val)(v),true)}}}};self.event('dblclick',config.selector2||'.exec2',fn('2'));self.event('click',config.selector||'.exec',fn(''))}});
