import { global } from '@storybook/global';

import type { Channel } from '@storybook/channels';
import { SET_CONFIG } from '@storybook/core-events';
import type {
  Addon_Collection,
  Addon_Config,
  Addon_Elements,
  Addon_Loaders,
  Addon_Type,
  Addon_Types,
} from '@storybook/types';
import { Addon_TypesEnum } from '@storybook/types';
import { logger } from '@storybook/client-logger';
import type { API } from '../index';
import { mockChannel } from './storybook-channel-mock';

export { Addon_Type as Addon, Addon_TypesEnum as types };

export function isSupportedType(type: Addon_Types): boolean {
  return !!Object.values(Addon_TypesEnum).find((typeVal) => typeVal === type);
}

export class AddonStore {
  constructor() {
    this.promise = new Promise((res) => {
      this.resolve = () => res(this.getChannel());
    }) as Promise<Channel>;
  }

  private loaders: Addon_Loaders<API> = {};

  private elements: Addon_Elements = {};

  private config: Addon_Config = {};

  private channel: Channel | undefined;

  /**
   * @deprecated will be removed in 8.0
   */
  private serverChannel: Channel | undefined;

  private promise: any;

  private resolve: any;

  getChannel = (): Channel => {
    // this.channel should get overwritten by setChannel. If it wasn't called (e.g. in non-browser environment), set a mock instead.
    if (!this.channel) {
      this.setChannel(mockChannel());
    }

    return this.channel;
  };

  /**
   * @deprecated will be removed in 8.0, use getChannel instead
   */
  getServerChannel = (): Channel => {
    if (!this.serverChannel) {
      throw new Error('Accessing non-existent serverChannel');
    }

    return this.serverChannel;
  };

  ready = (): Promise<Channel> => this.promise;

  hasChannel = (): boolean => !!this.channel;

  /**
   * @deprecated will be removed in 8.0, please use the normal channel instead
   */
  hasServerChannel = (): boolean => !!this.serverChannel;

  setChannel = (channel: Channel): void => {
    this.channel = channel;
    this.resolve();
  };

  /**
   * @deprecated will be removed in 8.0, please use the normal channel instead
   */
  setServerChannel = (channel: Channel): void => {
    this.serverChannel = channel;
  };

  getElements = (type: Addon_Types): Addon_Collection => {
    if (!this.elements[type]) {
      this.elements[type] = {};
    }
    return this.elements[type];
  };

  /**
   * Adds a panel to the addon store.
   * @param {string} id - The id of the panel.
   * @param {Addon_Type} options - The options for the panel.
   * @returns {void}
   *
   * @deprecated Use the 'add' method instead.
   * @example
   * addons.add('My Panel', {
   *   title: 'My Title',
   *   type: types.PANEL,
   *   render: () => <div>My Content</div>,
   * });
   */
  addPanel = (id: string, options: Addon_Type): void => {
    this.add(id, {
      type: Addon_TypesEnum.PANEL,
      ...options,
    });
  };

  /**
   * Adds an addon to the addon store.
   * @param {string} id - The id of the addon.
   * @param {Addon_Type} addon - The addon to add.
   * @returns {void}
   */
  add = (id: string, addon: Addon_Type) => {
    const { type } = addon;
    const collection = this.getElements(type);
    collection[id] = { id, ...addon };
  };

  setConfig = (value: Addon_Config) => {
    Object.assign(this.config, value);
    if (this.hasChannel()) {
      this.getChannel().emit(SET_CONFIG, this.config);
    } else {
      this.ready().then((channel) => {
        channel.emit(SET_CONFIG, this.config);
      });
    }
  };

  getConfig = () => this.config;

  /**
   * Registers an addon loader function.
   *
   * @param {string} id - The id of the addon loader.
   * @param {(api: API) => void} callback - The function that will be called to register the addon.
   * @returns {void}
   */
  register = (id: string, callback: (api: API) => void): void => {
    if (this.loaders[id]) {
      logger.warn(`${id} was loaded twice, this could have bad side-effects`);
    }
    this.loaders[id] = callback;
  };

  loadAddons = (api: any) => {
    Object.values(this.loaders).forEach((value) => value(api));
  };
}

// Enforce addons store to be a singleton
const KEY = '__STORYBOOK_ADDONS_MANAGER';

function getAddonsStore(): AddonStore {
  if (!global[KEY]) {
    global[KEY] = new AddonStore();
  }
  return global[KEY];
}

export const addons = getAddonsStore();

export { mockChannel };
