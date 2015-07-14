# swtestserver
## Simple node server for sw related tests

This is a very simple http server. By default:

 * Serves as static content (GET) the pages that live on the "static" directory.
 * Has a POST endpoint on /cspReport that just logs by console whatever it receives (ATM, will prolly store it at a later point)
 * For the get request, allows adding some headers to the response. To add a header, just add a query string with add_header=headerName:headerValue. At this moment, the only valid headers are
  ** Content-Security-Policy
  ** Content-Security-Policy-Report-Only

