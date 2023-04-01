import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { uuidValidateV4 } from "$lib/utils/uuidValidateV4";
import { sampleData } from '$lib/stores/blocksSampleData';
import produce from "immer";

/**
 * A string representing a UUID v4.
 * @typedef {string} UUIDv4
 * @pattern ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[4][a-fA-F0-9]{3}-[89aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$
 */

/**
 * @typedef {Object} Block
 * @property {string} [type] - The type of the block
 * @property {string} text - The text content of the block
 * @property {string[]} [annotations] - The annotations applied to the block
 * @property {({text?: string, id?: string, annotations?: string[]})[]} [children] - The child blocks of the block
 */

/**
 * @typedef {Record<UUIDv4, Block>} BlockStore
 */

export const rootBlock = writable("cdfd5205-aade-4847-8789-487e41d7ff3f")


function createBlockStore() {
	/**
	 * @type {import('svelte/store').Writable<BlockStore>}
	 */
  const { subscribe, set, update } = writable(sampleData);

  return {
    subscribe,
    set,
		update,

		/** 
		 * @param {UUIDv4} parentID] - The parent block where the data should be updated
		 * @param {number} indexInChildren - The child where the text should be updated
		 * @param {any} newText - The new text to be added
		 */ 
		updateChildText: ( parentID, indexInChildren, newText) => {
      update(store =>
        produce(store, draftStore => {
          if (
            draftStore[parentID] &&
            draftStore[parentID].children &&
            draftStore[parentID].children[indexInChildren]
          ) {
            draftStore[parentID].children[indexInChildren].text = newText;
          }
        })
      );
    },

		/** 
		 * @param {UUIDv4} blockID] - The parent block where the data should be updated
		 * @param {any} newText - The new text to be added
		 */ 
		updateBlockText: ( blockID, newText) => {
      update(store =>
        produce(store, draftStore => {
          if (draftStore[blockID]) {
            draftStore[blockID].text = newText;
          }
        })
      );
    },

		/**
		 * @param {{text: string, id?: string, type?: string}} data - The new block data to be inserted
		 * @param {UUIDv4} [parentID] - The parent block where the data should be inserted
		 * @param {number} [indexInChildren] - The position in children where the data should be inserted
		 * @param {number} [caretOffset] - The caret offset in a child's text property, after which the data should be inserted
		 * @param {?number} [offsetBefore] - An optional negative offset, e.g. set to "2" to remove the brackets [[
		 * @returns {UUIDv4|undefined} - For typed blocks: returns the new ID of the block
		 */
    insertBlock: (data = {text: ''}, parentID, indexInChildren, caretOffset, offsetBefore = 0) => {
      let blockID = '';
			/** @type { {id: string;} | undefined } */
			let blockRef;

			 // only blocks with type need an ID, others are (plain)text.
			if(data?.type){
				blockID = uuidv4();
				blockRef = {id: blockID};
			}

			update(store => {

				// Case 1: has type, but no parentID, add block to root of store.
				if (
					indexInChildren && typeof indexInChildren !== 'number' && indexInChildren < 0 &&
					caretOffset && typeof caretOffset !== 'number' &&  caretOffset < 0 &&
					(!parentID || !uuidValidateV4(parentID)) &&
					blockID
				) {
					return {
						...store, 
						[blockID]: data
					}
				}

				// Case 2: parentID and indexInChildren are defined, add block to parent.
				if (
					indexInChildren && typeof indexInChildren === 'number' && indexInChildren >= 0 &&
					(!caretOffset || typeof caretOffset !== 'number' ||  caretOffset < 0) &&
					parentID && uuidValidateV4(parentID)
				) {
					const parentData = store[parentID];
					const newChildren = parentData.children
						? [
								...parentData.children.slice(0, indexInChildren),
								// if block has type, add reference only
								...(blockRef ? [blockRef] : [data]),
								...parentData.children.slice(indexInChildren),
							]
						: [data];

					return {
						...store,
						[parentID]: {
							...parentData,
							children: newChildren,
						},
						// if block has type, add data to root
						...(blockRef ? {[blockID]: data} : {})
					};
				}
	
				// Case 3: parentID, indexInChildren and caretOffset are defined, add block after caretOffset at child of parent.
				if (
					typeof indexInChildren === 'number' && indexInChildren >= 0 &&
					typeof caretOffset === 'number' &&  caretOffset >= 0 &&
					parentID && uuidValidateV4(parentID)
				) {
					const parentData = store[parentID];
					
					if (!Array.isArray(parentData.children) || parentData.children.length === 0) {
						return store;
					}
					
					const currentText = parentData.children[indexInChildren].text;
					// TODO: in case of prompt, currentText does not exist at children, but can be found at root via id from "parentData.children[indexInChildren].id".
					const beforeCaretText = currentText?.slice(0, caretOffset - (offsetBefore ?? 0));
					const afterCaretText = currentText?.slice(caretOffset);

					const childrenBefore = parentData.children.slice(0, indexInChildren);
					const updatedChildBeforeCaret = { ...parentData.children[indexInChildren], text: beforeCaretText };
					const updatedChildAfterCaret = { ...parentData.children[indexInChildren], text: afterCaretText };
					const childrenAfter = parentData.children.slice(indexInChildren + 1);

					return {
						...store,
						[parentID]: {
							...parentData,
							children: [
								...childrenBefore,
								updatedChildBeforeCaret,
								// if block has type, add reference only
								...(blockRef ? [blockRef] : [data]),
								updatedChildAfterCaret,
								...childrenAfter,
							].filter(child => child !== null && child !== undefined),
						},
						// if block has type, add data to root
						...(blockRef ? {[blockID]: data} : {})
					};
				}

				// If none of the above casee is met, return old store
				return store;
			});


			if(blockID){
				return blockID
			}

    },
  };
}

export const blocks = createBlockStore();