import * as cbor from "cbor-x";

import Magic from "../types/magic.ts";
import BaseEvent from "./base.ts";

type AnnounceType =
  | "userJoin"
  | "status"
  | "userLeave"
  | "keyRotation"
  | "groupTerminate";

export type AnnounceEventPayload = {
  type: AnnounceType;
};

class AnnounceEvent extends BaseEvent {
  type: AnnounceType;

  constructor(type: AnnounceType) {
    super(Magic.Announce);
    this.type = type;
  }

  into() {
    return new Uint8Array([this.magic, ...cbor.encode({})]);
  }
}

export default AnnounceEvent;
