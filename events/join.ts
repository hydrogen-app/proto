import * as cbor from "cbor-x";
import { uid } from "uid";

import BaseEvent from "./base.ts";
import Magic from "../types/magic.ts";
import * as subtleUtils from "../utils/subtle.ts";

export type JoinEventPayload = {
  username: string;
  ecdsaPublicKey: Uint8Array;
  ecdhPublicKey: Uint8Array;
  signature: Uint8Array;
};

class JoinEvent extends BaseEvent {
  username: string;
  signature?: Uint8Array;
  ecdsaPair?: CryptoKeyPair;
  ecdhPair?: CryptoKeyPair;
  ecdsaRawPublicKey?: Uint8Array;
  ecdhRawPublicKey?: Uint8Array;

  constructor(username?: string) {
    super(Magic.Join);
    this.username = username ?? `guest-${uid(6)}`;
  }

  async init() {
    this.ecdsaPair = await subtleUtils.newECDSAPair();
    this.ecdhPair = await subtleUtils.newECDHPair();

    this.ecdhRawPublicKey = await subtleUtils.exportRawKey(
      this.ecdhPair.publicKey,
    );
    this.ecdsaRawPublicKey = await subtleUtils.exportRawKey(
      this.ecdsaPair.publicKey,
    );

    this.signature = await subtleUtils.signECDSA(
      this.ecdsaPair.privateKey,
      this.ecdhRawPublicKey,
    );

    this.ready = true;
  }

  into() {
    if (!this.ready) throw Error("Event not initialized.");

    return new Uint8Array([
      this.magic,
      ...cbor.encode({
        username: this.username,
        ecdsaPublicKey: this.ecdsaRawPublicKey,
        ecdhPublicKey: this.ecdhRawPublicKey,
        signature: this.signature,
      } as JoinEventPayload),
    ]);
  }
}

export default JoinEvent;
