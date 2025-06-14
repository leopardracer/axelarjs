import type { Environment } from "@axelarjs/core";

import { createAxelarConfigClient } from "../..";
import { AssetConfig, AssetInfo, ChainInfo, LoadChainConfig } from "./types";

export async function loadChains(config: LoadChainConfig) {
  const axelarConfigClient = createAxelarConfigClient(
    config.environment as Environment
  );
  const allAssets = Object.values(
    (await axelarConfigClient.getAxelarAssetConfigs()) as {
      [key: string]: AssetConfig;
    }
  );

  const _environment = config.environment as Environment;

  const rawChains = Object.values(
    (await axelarConfigClient.getAxelarChainConfigs()) as ChainInfo
  ) as ChainInfo[];

  /*push assets to supported chains*/
  rawChains.forEach((chainInfo) => {
    const filteredAssetList: AssetConfig[] = allAssets.filter(
      ({ chain_aliases }) =>
        Object.keys(chain_aliases).includes(chainInfo.chainName.toLowerCase())
    );

    const assetsList: AssetInfo[] = [];

    filteredAssetList.forEach((asset) => {
      const assetToPush = {
        ...asset.chain_aliases[chainInfo.chainName.toLowerCase()],
        common_key: asset.common_key[_environment] as string,
        native_chain: asset.native_chain,
        decimals: asset.decimals,
        fullySupported: asset.fully_supported,
      };
      assetsList.push(assetToPush);
    });

    chainInfo.assets = assetsList;
  });

  return rawChains;
}
