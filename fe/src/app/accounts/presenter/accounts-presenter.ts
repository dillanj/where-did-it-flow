import { derive, type DerivedSignal } from "@tcn/state";
import type { AccountsDomain } from "../domain/accounts-domain";
import type { Account } from "../domain/domain-model";

const isPending = (status: string) => {
  return status === "PENDING";
};

const sortAccountsByNewest = (accounts: Account[]) => {
  return [...accounts].sort((left, right) => {
    const leftCreatedAt = left.createdAt ?? "";
    const rightCreatedAt = right.createdAt ?? "";

    return rightCreatedAt.localeCompare(leftCreatedAt);
  });
};

export class AccountsPresenter {
  private readonly _domain: AccountsDomain;

  private readonly _sortedAccounts: DerivedSignal<Account[]>;
  private readonly _isInitializing: DerivedSignal<boolean>;
  private readonly _isManagingAccount: DerivedSignal<boolean>;
  private readonly _errorMessage: DerivedSignal<string | null>;

  constructor(input: { domain: AccountsDomain }) {
    this._domain = input.domain;

    this._sortedAccounts = derive(this._domain.accountsBroadcast, (accounts) => {
      return sortAccountsByNewest(accounts);
    });

    this._isInitializing = derive(this._domain.initializeRunner.stateBroadcast, (runnerState) => {
      return isPending(runnerState.status);
    });

    this._isManagingAccount = derive(this._domain.createAccountRunner.stateBroadcast, (runnerState) => {
      return isPending(runnerState.status);
    });

    this._errorMessage = derive(
      this._domain.initializeRunner.stateBroadcast,
      this._domain.createAccountRunner.stateBroadcast,
      (initializeRunnerState, createAccountRunnerState) => {
        return initializeRunnerState.error?.message ?? createAccountRunnerState.error?.message ?? null;
      },
    );
  }

  get broadcasts() {
    return {
      accounts: this._sortedAccounts.broadcast,
      selectedAccountId: this._domain.selectedAccountId.broadcast,
      message: this._domain.message.broadcast,
      isInitializing: this._isInitializing.broadcast,
      isManagingAccount: this._isManagingAccount.broadcast,
      errorMessage: this._errorMessage.broadcast,
      initializeRunnerState: this._domain.initializeRunner.stateBroadcast,
      createAccountRunnerState: this._domain.createAccountRunner.stateBroadcast,
    };
  }

  dispose = () => {
    this._sortedAccounts.dispose();
    this._isInitializing.dispose();
    this._isManagingAccount.dispose();
    this._errorMessage.dispose();
  };
}
