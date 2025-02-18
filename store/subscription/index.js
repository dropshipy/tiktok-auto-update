export const state = () => ({
  subscriptions: [],
  hasPremiumPlan: false,
  hasBuyerPlan: false,
  subscriptionPremium: {},
  subscriptionBuyer: {},
});

export const getters = {
  getSubscriptionInfo(state) {
    return state.subscriptions;
  },
  getHasPremiumPlan(state) {
    return state.hasPremiumPlan;
  },
  getSubscriptionPremium(state) {
    return state.subscriptionPremium;
  },
  getHasBuyerPlan(state) {
    return state.hasBuyerPlan;
  },
  getSubscriptionBuyer(state) {
    return state.subscriptionBuyer;
  },
};

export const mutations = {
  /**
   * @param { Array } subscription
   */
  setSubscriptionInfo(state, subscription) {
    if (subscription.length > 0) {
      state.subscriptions = subscription;

      const subscriptionPremium = subscription.find(
        (el) =>
          (el.status == "active" &&
            el.subscriptionPlan.type.includes("premium")) ||
          (el.status == "active" && el.subscriptionPlan.type.includes("trial"))
      );
      const subscriptionBuyer = subscription.find(
        (el) =>
          (el.status == "active" &&
            el.subscriptionPlan.type.includes("buyer")) ||
          (el.status == "active" && el.subscriptionPlan.type.includes("trial"))
      );

      state.hasPremiumPlan = subscriptionPremium ? true : false;
      state.hasBuyerPlan = subscriptionBuyer ? true : false;

      state.subscriptionPremium = subscriptionPremium;
      state.subscriptionBuyer = subscriptionBuyer;
    }
  },
};

export const actions = {
  setSelectedSubscription({ state }, type) {
    const { subscriptions } = state;
    if (subscriptions.length > 0) {
      state.subscriptions = subscriptions;
      const findSubscription = subscriptions.find(
        (el) =>
          (el.status == "active" && el.subscriptionPlan.type.includes(type)) ||
          (el.status == "active" && el.subscriptionPlan.type.includes("trial"))
      );

      if (findSubscription) {
        const accountSubscription = electronStore.get("account-subscription");
        electronStore.set("account-subscription", {
          ...accountSubscription,
          subscription: findSubscription.code,
        });
        return findSubscription;
      }
      return null;
    }
  },
};
