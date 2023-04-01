import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { uuidValidateV4 } from "$lib/utils/uuidValidateV4";


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
 * @property {({text: string, id?: string, annotations?: string[]})[]} [children] - The child blocks of the block
 */

/**
 * @typedef {Record<UUIDv4, Block>} BlockStore
 */

export const rootBlock = writable("cdfd5205-aade-4847-8789-487e41d7ff3f")

/**
 * @type {import('svelte/store').Writable<BlockStore>}
 */
export const blocks = writable({
	'cdfd5205-aade-4847-8789-487e41d7ff3f': {
		type: 'prompt', 
		text: 'Travel Planner',
		annotations: ['bold'],
		children: [
			{text: 'Create a travel itinerary for ' },
			{text: 'main travel destination', id: '5ebdae0f-5913-4eca-857d-51042c4f9095', annotations: ['bold'] },
			{text: ' and ' },
			{text: 'list of locations', id: '2cd38d2e-aa60-4864-92eb-69a7acd2307a' },
			{text: ', starting on ' },
			{text: 'start date', id: '3c71b7f8-7c65-4251-a9ce-6feff919b7cc' },
			{text: ' plus/minus ' },
			{text: 'flexible days', id: '7d5c5bf9-dcb7-4815-b303-1be5de29523e' },
			{text: ' and ending on ' },
			{text: 'end date', id: 'edb9d293-84ca-4a8a-8682-b8c90d2d7e09' },
			{text: ' plus/minus ' },
			{text: 'flexible days', id: '635c9251-cf7b-47e8-802a-a7552fc64fb7' },
		],
	},
	'5ebdae0f-5913-4eca-857d-51042c4f9095': {
		text: 'main travel destination',
		children: [
			{text: 'Based on this '},
			{text: 'list of travel preferences', id: 'b6087f54-86da-46af-90ad-52c20822b77b' },
			{text: ' create a list of the top 10 best matching places'},
		]
	},
	'b6087f54-86da-46af-90ad-52c20822b77b': {
		text: 'list of travel preferences',
		children: [
			{text: 'The general preferences are: warm; mostly sunny; clean air; affordable; yummy food; friendly people;'}
		]
	},
	'2cd38d2e-aa60-4864-92eb-69a7acd2307a': {
		text: 'list of locations',
		children: [
			{text: 'Based on the single top ranked '},
			{text: 'main travel destination', id: '5ebdae0f-5913-4eca-857d-51042c4f9095' },
			{text: ' create a list of 20 locations that also consider my '},
			{text: 'list of travel preferences', id: 'b6087f54-86da-46af-90ad-52c20822b77b' },
			{text: '.'},
		]
	},
	'3c71b7f8-7c65-4251-a9ce-6feff919b7cc': {
		text: 'start date',
		children: [
			{text: 'May 1st, 2023'},
		]
	},
	'7d5c5bf9-dcb7-4815-b303-1be5de29523e': {
		text: 'flexible days',
	},
	'edb9d293-84ca-4a8a-8682-b8c90d2d7e09': {
		text: 'end date',
		children: [
			{text: 'May 25th, 2023'},
		]
	},
	'635c9251-cf7b-47e8-802a-a7552fc64fb7': {
		text: 'flexible days',
		children: [
			{text: 'minus 2 days, plus 5 days'},
		]
	},
});


/**
 * @param {{text: string, id?: string}} newBlock - The new block data to be inserted
 * @param {UUIDv4} [parentID] - The parent block where the data should be inserted
 * @param {number} [indexInChildren] - The position in children where the data should be inserted
 * @param {number} [caretOffset] - The caret offset in a child's text property, after which the data should be inserted
 * @param {?number} [offsetBefore] - An optional negative offset, e.g. set to "2" to remove the brackets [[
 */
export function insertBlock(newBlock = {text: ''}, parentID, indexInChildren, caretOffset, offsetBefore = 0) {

	const blockID = uuidv4();

	// Case 1: no parentID defined, add block to root of store.
	if (
		indexInChildren && typeof indexInChildren !== 'number' && indexInChildren < 0 &&
		caretOffset && typeof caretOffset !== 'number' &&  caretOffset < 0 &&
		(!parentID || !uuidValidateV4(parentID))
	) {
		blocks.update(store => {
			return {
				...store, 
				[blockID]: newBlock
			}
		});
		return blockID;
	}

	// Case 2: parentID and indexInChildren are defined, add block to parent.
	if (
		indexInChildren && typeof indexInChildren === 'number' && indexInChildren >= 0 &&
		(!caretOffset || typeof caretOffset !== 'number' ||  caretOffset < 0) &&
		parentID && uuidValidateV4(parentID)
	) {
		blocks.update(store => {
			const parentData = store[parentID];
			const newChildren = parentData.children
				? [
						...parentData.children.slice(0, indexInChildren),
						{...newBlock, id: blockID},
						...parentData.children.slice(indexInChildren),
					]
				: [{...newBlock, id: blockID}];

			return {
				...store,
				[parentID]: {
					...parentData,
					children: newChildren,
				},
			};
		});
		return blockID;
	}

	// Case 3: parentID, indexInChildren and caretOffset are defined, add block after caretOffset at child of parent.
	if (
		typeof indexInChildren === 'number' && indexInChildren >= 0 &&
		typeof caretOffset === 'number' &&  caretOffset >= 0 &&
		parentID && uuidValidateV4(parentID)
	) {
		blocks.update(store => {
			const parentData = store[parentID];
			
			if (!Array.isArray(parentData.children) || parentData.children.length === 0) {
				return store;
			}
			
			const currentText = parentData.children[indexInChildren].text;
			const beforeCaretText = currentText.slice(0, caretOffset - (offsetBefore ?? 0));
			const afterCaretText = currentText.slice(caretOffset);

			const childrenBefore = parentData.children.slice(0, indexInChildren);
			const updatedChildBeforeCaret = { ...parentData.children[indexInChildren], text: beforeCaretText };
			const newInsertedBlock = newBlock ? [{...newBlock, id: blockID }] : [];
			const updatedChildAfterCaret = { ...parentData.children[indexInChildren], text: afterCaretText };
			const childrenAfter = parentData.children.slice(indexInChildren + 1);

			return {
				...store,
				[parentID]: {
					...parentData,
					children: [
						...childrenBefore,
						updatedChildBeforeCaret,
						...newInsertedBlock,
						updatedChildAfterCaret,
						...childrenAfter,
					].filter(child => child !== null && child !== undefined),
				},
			};
		});
		return blockID;
	}

}
