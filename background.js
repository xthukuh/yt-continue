import { addListener, sendMessage } from './utils-chrome.js';
import log from './utils-log.js';

// export const onMessageExternal = (listener) => {
//   chrome.runtime.onMessageExternal.addListener(
//     async (messagePayload, sender, sendResponse) => {
//       try {
//         const response = await listener(messagePayload, sender);
//         sendResponse(response);
//       } catch (e) {
//         const { message, stack, name } = e;
//         // How you wrap errors is up to you, but the client
//         // and server must agree on the contract.
//         sendResponse({
//           isError: true,
//           message,
//           stack,
//           name,
//         });
//       }
//     },
//   );
// };

(() => {
	
	//onMessage
	// addListener('extension', 'onMessage', (request, sender, sendResponse) => {
	addListener('runtime', 'onMessage', (request, sender, sendResponse) => {
		log('info', 'background.js handle - onMessage', {request, sender, sendResponse});
		sendResponse();
	}, 'background.js');
  // addListener('runtime', 'onMessageExternal', (request, sender, sendResponse) => {
	// 	log('info', 'background.js handle - onMessageExternal', {request, sender, sendResponse});
	// 	sendResponse();
	// }, 'background.js');

	//...
})();