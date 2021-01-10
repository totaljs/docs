::: __`POST   `__ `/account/create/`

__Notes__:
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- `token` String(6)
- __`firstname`__ Name(40)
- __`lastname`__ Name(40)
- __`email`__ Email
- __`phone`__ Phone
- __`password`__ String(50)
- `name` String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`POST   `__ `/account/login/`

__Notes__:
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`login`__ String(50)
- __`password`__ String(40)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/account/logout/`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/agencies/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `name` String(50)
- `email` String(120)
- `recordprefix` String(10)
- `rate` Number
- `url` String(50)
- `phone` Phone
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
- `dtcreated` Date
- `id` UID

:::

::: __`GET    `__ `/agencies/{id}/`

__Notes__:
- request __must be authorized__

:::

::: __`POST   `__ `/agencies/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Request data__:
- `name` String(50)
- `email` String(120)
- `recordprefix` String(10)
- `rate` Number
- `url` String(50)
- `phone` Phone
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +account_login`

__Notes__:
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`login`__ String(50)
- __`password`__ String(40)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -account_detail`

__Notes__:
- request __must be authorized__

:::

::: __`API    `__ `/apiv1/   +account_confirm/{token}/`

__Notes__:
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`token`__ String(100)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -customers_query`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `typeid` [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
- `rate` Number
- `dtcreated` Date
- `id` UID
- `name` String
- `recordscount` Number
- `iscompany` Boolean
- `color` String
- `icon` String
- `photo` String
- `phone` Phone
- `email` Email

:::

::: __`API    `__ `/apiv1/   -customers_records/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `statusid` String
- `customerid` String
- `number` String
- `reference` String
- `name` String
- `note` String
- `color` String
- `icon` String
- `timer` Number
- `remind` String
- `dtremind` Date
- `dtcreated` Date
- `dtupdated` Date
- `judge` String
- `counterparty` String
- `court` String

:::

::: __`API    `__ `/apiv1/   -customers_remove/{id}`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +customers_update/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `rate` Number

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -records_read/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `statusid` String
- `customerid` String
- `reference` String
- `number` String
- `name` String
- `note` String
- `color` String
- `icon` String
- `remind` String
- `counterparty` String
- `court` String
- `judge` String
- `timer` String
- `ispublic` String
- `dtremind` String
- `dtbeg` String
- `dttimer` String
- `dtcreated` String
- `dtupdated` String

:::

::: __`API    `__ `/apiv1/   -account_logout`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +records_insert`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`customerid`__ UID
- `statusid` []
- __`name`__ String(50)
- `note` String(500)
- `counterparty` String(50)
- `court` String(50)
- `judge` String(100)
- `ispublic` Boolean
- `timer` Number
- `color` String(7)
- `icon` String(30)
- `remind` String(300)
- `reference` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +records_update/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`customerid`__ UID
- `statusid` []
- __`name`__ String(50)
- `note` String(500)
- `counterparty` String(50)
- `court` String(50)
- `judge` String(100)
- `ispublic` Boolean
- `timer` Number
- `color` String(7)
- `icon` String(30)
- `remind` String(300)
- `reference` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +customers_insert`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `rate` Number

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -records_docs_read/{recordid}/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `typeid` String
- `name` String
- `reference` String
- `note` String
- `color` String
- `icon` String
- `filename` String
- `ext` String
- `type` String
- `size` String
- `dtcreated` String
- `dtupdated` String
- `url` String

:::

::: __`API    `__ `/apiv1/   -records_docs_delete/{recordid}/{id}`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +account_create`

__Notes__:
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- `token` String(6)
- __`firstname`__ Name(40)
- __`lastname`__ Name(40)
- __`email`__ Email
- __`phone`__ Phone
- __`password`__ String(50)
- `name` String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +records_docs_update/{recordid}/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ []
- __`name`__ String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   #records_docs_update_part/{recordid}/{id}`

__Notes__:
- request __must be authorized__
- request __can contain partialled data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- `note` String(500)
- `type` String(40)
- `size` Number
- __`fileid`__ UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -records_docs_query/{recordid}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `typeid` []
- `name` String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)
- `dtcreated` Date
- `dtupdated` Date
- `id` UID
- `updater` String
- `note` String
- `url` String

:::

::: __`API    `__ `/apiv1/   -users_query`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `dtcreated` Date
- `id` UID
- `firstname` String
- `lastname` String
- `name` String
- `search` String
- `roles` Array
- `sa` Boolean
- `isonline` Boolean
- `isconfirmed` Boolean
- `phone` Phone
- `email` Email

:::

::: __`API    `__ `/apiv1/   -users_read/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `agencyid` String
- `firstname` String
- `lastname` String
- `name` String
- `search` String
- `email` String
- `phone` String
- `note` String
- `notifications` String
- `sa` String
- `isonline` String
- `isconfirmed` String

:::

::: __`API    `__ `/apiv1/   -customers_read/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `languageid` String
- `photo` String
- `firstname` String
- `lastname` String
- `gender` String
- `address` String
- `name` String
- `email` String
- `phone` String
- `company` String
- `companyid` String
- `companyvatid` String
- `companytaxid` String
- `companyaddress` String
- `color` String
- `icon` String
- `note` String
- `remind` String
- `ispriority` String
- `ispinned` String
- `iscompany` String
- `isactive` String
- `isonline` String
- `isdisabled` String
- `dtcreated` String
- `dtupdated` String
- `rate` String

:::

::: __`API    `__ `/apiv1/   +users_update/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -records_changelog/{recordid}/{id}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` UID
- `username` String
- `record` String
- `recordid` UID
- `note` String
- `dtcreated` Date
- `agencyid` UID
- `documentid` UID
- `url` String

:::

::: __`API    `__ `/apiv1/   -agencies_read`

__Notes__:
- request __must be authorized__

:::

::: __`API    `__ `/apiv1/   -agencies_remove`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -records_remove/{id}`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +agencies_invite`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`firstname`__ Name(40)
- __`lastname`__ Name(40)
- __`email`__ Email
- __`phone`__ Phone
- __`password`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +agencies_user_update`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`firstname`__ Name(40)
- __`lastname`__ Name(40)
- __`email`__ Email
- __`phone`__ Phone
- __`password`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -agencies_query`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `name` String(50)
- `email` String(120)
- `recordprefix` String(10)
- `rate` Number
- `url` String(50)
- `phone` Phone
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
- `dtcreated` Date
- `id` UID

:::

::: __`API    `__ `/apiv1/   -templates_read/{id}`

__Notes__:
- request __must be authorized__

:::

::: __`API    `__ `/apiv1/   -templates_delete`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +records_docs_insert/{recordid}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ []
- __`name`__ String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +templates_update/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`name`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -invoices_query`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` UID
- `dtcreated` Date

:::

::: __`API    `__ `/apiv1/   -templates_query`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `name` String(50)
- `dtcreated` Date
- `id` UID

:::

::: __`API    `__ `/apiv1/   -timers_query/{customerid}`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `timer` Number
- `note` String(300)
- `id` UID
- `recordid` UID
- `timer` Number
- `record` String
- `name` String
- `note` String
- `isevaluated` Boolean
- `dtevaluated` Date
- `dtcreated` Date

:::

::: __`API    `__ `/apiv1/   +timers_add/{customerid}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Query arguments__:
- `recordid`

__Request data__:
- `timer` Number
- `note` String(300)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -users_delete/{id}`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   -search`

__Notes__:
- request __must be authorized__

__Query arguments__:
- `q`

:::

::: __`API    `__ `/apiv1/   -invoices_pay/{id}`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +agencies_update`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Request data__:
- `name` String(50)
- `email` String(120)
- `recordprefix` String(10)
- `rate` Number
- `url` String(50)
- `phone` Phone
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +templates_insert/{id}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`name`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`API    `__ `/apiv1/   +timers_evaluate/{customerid}`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Query arguments__:
- `recordid`

__Request data__:
- `timer` Number
- `note` String(300)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/cl/`

__Notes__:
- request __must be authorized__

:::

::: __`GET    `__ `/customers/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `typeid` [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
- `rate` Number
- `dtcreated` Date
- `id` UID
- `name` String
- `recordscount` Number
- `iscompany` Boolean
- `color` String
- `icon` String
- `photo` String
- `phone` Phone
- `email` Email

:::

::: __`POST   `__ `/customers/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `rate` Number

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/customers/{id}/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `languageid` String
- `photo` String
- `firstname` String
- `lastname` String
- `gender` String
- `address` String
- `name` String
- `email` String
- `phone` String
- `company` String
- `companyid` String
- `companyvatid` String
- `companytaxid` String
- `companyaddress` String
- `color` String
- `icon` String
- `note` String
- `remind` String
- `ispriority` String
- `ispinned` String
- `iscompany` String
- `isactive` String
- `isonline` String
- `isdisabled` String
- `dtcreated` String
- `dtupdated` String
- `rate` String

:::

::: __`POST   `__ `/customers/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ [fo]
- `firstname` String(50)
- `lastname` String(50)
- `color` String(7)
- `icon` String(30)
- `note` String(300)
- `gender` []
- `address` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `phone` Phone
- `email` Email
- `dtbirth` Date
- `company` String(50)
- `companyid` String(20)
- `companyvatid` String(20)
- `companytaxid` String(20)
- `companyaddress` Address
	- `street` String(50)
	- `number` String(30)
	- `city` String(50)
	- `zip` Zip
	- `country` String(50)
- `rate` Number

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/customers/{id}/records/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `statusid` String
- `customerid` String
- `number` String
- `reference` String
- `name` String
- `note` String
- `color` String
- `icon` String
- `timer` Number
- `remind` String
- `dtremind` Date
- `dtcreated` Date
- `dtupdated` Date
- `judge` String
- `counterparty` String
- `court` String

:::

::: __`POST   `__ `/records/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`customerid`__ UID
- `statusid` []
- __`name`__ String(50)
- `note` String(500)
- `counterparty` String(50)
- `court` String(50)
- `judge` String(100)
- `ispublic` Boolean
- `timer` Number
- `color` String(7)
- `icon` String(30)
- `remind` String(300)
- `reference` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/records/{id}/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `statusid` String
- `customerid` String
- `reference` String
- `number` String
- `name` String
- `note` String
- `color` String
- `icon` String
- `remind` String
- `counterparty` String
- `court` String
- `judge` String
- `timer` String
- `ispublic` String
- `dtremind` String
- `dtbeg` String
- `dttimer` String
- `dtcreated` String
- `dtupdated` String

:::

::: __`POST   `__ `/records/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`customerid`__ UID
- `statusid` []
- __`name`__ String(50)
- `note` String(500)
- `counterparty` String(50)
- `court` String(50)
- `judge` String(100)
- `ispublic` Boolean
- `timer` Number
- `color` String(7)
- `icon` String(30)
- `remind` String(300)
- `reference` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/records/{recordid}/documents/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `typeid` []
- `name` String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)
- `dtcreated` Date
- `dtupdated` Date
- `id` UID
- `updater` String
- `note` String
- `url` String

:::

::: __`POST   `__ `/records/{recordid}/documents/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ []
- __`name`__ String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/records/{recordid}/documents/{id}/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` String
- `typeid` String
- `name` String
- `reference` String
- `note` String
- `color` String
- `icon` String
- `filename` String
- `ext` String
- `type` String
- `size` String
- `dtcreated` String
- `dtupdated` String
- `url` String

:::

::: __`PATCH  `__ `/records/{recordid}/documents/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- `note` String(500)
- `type` String(40)
- `size` Number
- __`fileid`__ UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`POST   `__ `/records/{recordid}/documents/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`typeid`__ []
- __`name`__ String(50)
- `note` String(500)
- `color` String(7)
- `icon` String(30)
- `reference` String(50)
- `customerid` UID)(null)
- `type` String(40)
- `size` Number
- `fileid` UID
- `filename` String(100)
- `ext` String(30)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/records/{recordid}/documents/{id}/changelog/`

__Response__:

Response is serialized in JSON format with the fields declared below:
- `id` UID
- `username` String
- `record` String
- `recordid` UID
- `note` String
- `dtcreated` Date
- `agencyid` UID
- `documentid` UID
- `url` String

:::

::: __`GET    `__ `/search/`

__Query arguments__:
- `q`

:::

::: __`GET    `__ `/templates/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `name` String(50)
- `dtcreated` Date
- `id` UID

:::

::: __`POST   `__ `/templates/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`name`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/templates/{id}/`

__Notes__:
- request __must be authorized__

:::

::: __`POST   `__ `/templates/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format
- __fields marked as bold__ are required

__Request data__:
- __`name`__ String(50)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/timers/{customerid}/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `timer` Number
- `note` String(300)
- `id` UID
- `recordid` UID
- `timer` Number
- `record` String
- `name` String
- `note` String
- `isevaluated` Boolean
- `dtevaluated` Date
- `dtcreated` Date

:::

::: __`POST   `__ `/timers/{customerid}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Query arguments__:
- `recordid`

__Request data__:
- `timer` Number
- `note` String(300)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`POST   `__ `/timers/{customerid}/evaluate/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Query arguments__:
- `recordid`

__Request data__:
- `timer` Number
- `note` String(300)

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/users/`

__Notes__:
- request __must be authorized__

__Response__:

Response is serialized in JSON format with the fields declared below:
- `dtcreated` Date
- `id` UID
- `firstname` String
- `lastname` String
- `name` String
- `search` String
- `roles` Array
- `sa` Boolean
- `isonline` Boolean
- `isconfirmed` Boolean
- `phone` Phone
- `email` Email

:::

::: __`DELETE `__ `/users/{id}/`

__Notes__:
- request __must be authorized__

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

::: __`GET    `__ `/users/{id}/`

__Notes__:
- request __must be authorized__

__Response__:
- `id` String
- `agencyid` String
- `firstname` String
- `lastname` String
- `name` String
- `search` String
- `email` String
- `phone` String
- `note` String
- `notifications` String
- `sa` String
- `isonline` String
- `isconfirmed` String

:::

::: __`POST   `__ `/users/{id}/`

__Notes__:
- request __must be authorized__
- request __must contain data__ in JSON format

__Output__:
```js
{
	"success": true,
	[value: Object]
}
```
:::

