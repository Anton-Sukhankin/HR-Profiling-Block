(function () {
    const app = window.HRProfileApp || {};

    const getStore = () => (window.HRProfileApp || {}).profileStore;

    const updateProfile = (profile, input) => {
        const store = getStore();
        if (!profile || !store) return null;
        return store.update(profile.id, input);
    };

    const archive = (profile) => updateProfile(profile, { status: "В архиве" });

    const sendToReview = (profile) => updateProfile(profile, { status: "На оценке" });

    const updateClassifier = (profile, classifier) => updateProfile(profile, { classifier });

    const updateOkzCode = (profile, okzCode) => updateProfile(profile, { okzCode });

    app.profileCardActions = {
        updateProfile,
        archive,
        sendToReview,
        updateClassifier,
        updateOkzCode
    };

    window.HRProfileApp = app;
})();
