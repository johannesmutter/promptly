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
	/** @type {import('svelte/store').Writable<BlockStore>} */
  const { subscribe, set, update } = writable(sampleData);

  return {
    subscribe,
    set,
		update,

		/**
		 * @param {UUIDv4} parentID - The parent block where the data should be updated
		 * @param {number} indexInChildren - The child where the property should be updated
		 * @param {string} property - The property to be updated
		 * @param {any} value - The new value to be assigned to the property
		 */
		updateChildProperty: (parentID, indexInChildren, property, value) => {
			update(store =>
				produce(store, draftStore => {
					if (draftStore?.[parentID]?.children?.[indexInChildren]) {
						// @ts-ignore
						draftStore[parentID].children[indexInChildren][property] = value;
					}
				})
			);
		},


		/**
		 * @param {UUIDv4} blockID - The block where the data should be updated
		 * @param {string} property - The property to be updated
		 * @param {any} value - The new value to be assigned to the property
		 */
		updateBlockProperty: (blockID, property, value) => {
			update(store =>
				produce(store, draftStore => {
					if (draftStore[blockID]) {
						draftStore[blockID][property] = value;
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

			update(store => produce(store, draftStore => {

				const isValidParentID = parentID && uuidValidateV4(parentID);
				const isValidIndexInChildren = typeof indexInChildren !== 'undefined' && Number.isInteger(indexInChildren) && indexInChildren >= 0;
				const isValidCaretOffset = typeof caretOffset !== 'undefined' && Number.isInteger(caretOffset) && caretOffset >= 0;
		
				// Case 1: has type, but no parentID, add block to root of store.
				if (!isValidParentID && blockID) {
					// Case 1: has type, but no parentID, add block to root of store.
					draftStore[blockID] = data;
					return;
				}
		
				if (!isValidParentID) {
					return;
				}
		
				const parentData = draftStore[parentID];
		
				// Case 2: parentID and indexInChildren are defined, add block to parent.
				if (parentData.children && isValidIndexInChildren && !isValidCaretOffset) {
					const newChildren = [
						...parentData.children.slice(0, indexInChildren),
						// if block has type, add reference only
						...(blockRef ? [blockRef] : [data]),
						...parentData.children.slice(indexInChildren),
					]
					parentData.children = newChildren;
		
				} else if (
					parentData.children &&
					isValidIndexInChildren &&
					isValidCaretOffset
				) {
					// Case 3: parentID, indexInChildren, and caretOffset are defined, add block after caretOffset at child of parent.
					const currentChild = parentData?.children?.[indexInChildren];
					if (currentChild) {
						const currentText = currentChild.text;
						// TODO: in case of prompt, currentText does not exist at children, but can be found at root via id from "parentData.children[indexInChildren].id".
						const beforeCaretText = currentText?.slice(0, caretOffset - (offsetBefore ?? 0));
						const afterCaretText = currentText?.slice(caretOffset);
		
						parentData.children.splice(indexInChildren, 1,
							{ ...currentChild, text: beforeCaretText },
							...(blockRef ? [blockRef] : [data]),
							{ ...currentChild, text: afterCaretText }
						);
					}
				}
		
				if (blockRef) {
					draftStore[blockID] = data;
				}

			}))

			if(blockID){
				return blockID
			}

    },
  };
}

export const blocks = createBlockStore();