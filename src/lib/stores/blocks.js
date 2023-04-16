import { writable, derived } from 'svelte/store';
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
 * A string representing a datetime in ISO 8601 format.
 * @typedef {string} DatetimeString
 */

/**
 * @typedef {Object} Block
 * @property {string} [type] - The type of the block
 * @property {string} text - The text content of the block
 * @property {DatetimeString} createdAt - The datetime the block has been last updated
 * @property {boolean} [selected] - The block is selected in the UI
 * @property {string[]} [annotations] - The annotations applied to the block
 * @property {({text?: string, id?: string, annotations?: string[]})[]} [children] - The child blocks of the block
 */


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
		 * Marks a block as selected or unselected
		 * @param {UUIDv4} blockID - The ID of the block to toggle selection state
		 */
		toggleBlockSelection: (blockID) => {
			update(store =>
				produce(store, draftStore => {
					if (draftStore[blockID]) {
						if(draftStore[blockID]["selected"]){
							draftStore[blockID]["selected"] = false;
						} else {
							draftStore[blockID]["selected"] = true;
						}
					}
				})
			);
		},

		/**
		 * Marks a block as selected and unselects the other blocks.
		 * @param {UUIDv4} blockID - The ID of the block to mark as selected
		 */
		selectSingleBlock: (blockID) => {
			update(store =>
				produce(store, draftStore => {
					Object.keys(draftStore).forEach((key) => {
						draftStore[key].selected = key === blockID;
					});
				})
			);
		},
		


		/**
		 * @param {{text: string, id?: string, type?: string, createdAt?: DatetimeString}} data - The new block data to be inserted
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

				// add date to block
				const now = new Date();
				data.createdAt = now.toISOString(); // Save as ISO 8601
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


/**
 * A derived store that contains an array of IDs of selected blocks.
 * @type {import('svelte/store').Readable<UUIDv4[]>}
 */
export const selectedBlockIDs = derived(blocks, ($blocks) =>
  Object.keys($blocks).filter((key) => $blocks[key].selected)
);

