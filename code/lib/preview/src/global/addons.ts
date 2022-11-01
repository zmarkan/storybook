/* eslint-disable no-underscore-dangle */
import type * as ADDONS from '../addons';

const {
  useMemo,
  addons,
  useArgs,
  useCallback,
  applyHooks,
  isSupportedType,
  makeDecorator,
  mockChannel,
  useChannel,
  useEffect,
  useGlobals,
  useParameter,
  useReducer,
  useRef,
  useState,
  useStoryContext,
  types,
  AddonStore,
  HooksContext,
} = (globalThis as any).__STORYBOOK_MODULE_ADDONS__ as typeof ADDONS;

export {
  useMemo,
  addons,
  useArgs,
  useCallback,
  applyHooks,
  isSupportedType,
  makeDecorator,
  mockChannel,
  useChannel,
  useEffect,
  useGlobals,
  useParameter,
  useReducer,
  useRef,
  useState,
  useStoryContext,
  types,
  AddonStore,
  HooksContext,
};
