(function () {
    const app = window.HRProfileApp || {};
    const model = app.profileModel;
    const STORAGE_KEY = "hr-profile-prototype.profiles";

    const canUseStorage = () => {
        try {
            const testKey = `${STORAGE_KEY}.test`;
            window.localStorage.setItem(testKey, "1");
            window.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    };

    const storageAvailable = canUseStorage();

    const readPersistedProfiles = () => {
        if (!storageAvailable) return null;

        try {
            const rawProfiles = window.localStorage.getItem(STORAGE_KEY);
            const parsedProfiles = rawProfiles ? JSON.parse(rawProfiles) : null;
            return Array.isArray(parsedProfiles) ? parsedProfiles : null;
        } catch (error) {
            return null;
        }
    };

    const persist = () => {
        if (!storageAvailable) return;

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getProfiles()));
        } catch (error) {
            console.warn("Не удалось сохранить профили в localStorage", error);
        }
    };

    const getProfiles = () => {
        window.profiles = Array.isArray(window.profiles) ? window.profiles : [];
        return window.profiles;
    };

    const notify = () => {
        persist();

        if (window.renderProfilesTable) {
            window.renderProfilesTable(getProfiles());
        }
    };

    const normalizeAll = () => {
        const persistedProfiles = readPersistedProfiles();
        if (persistedProfiles) {
            window.profiles = persistedProfiles;
        }

        const profiles = getProfiles();
        profiles.forEach((profile, index) => {
            profiles[index] = model.normalizeProfile(profile);
        });
        persist();
        return profiles;
    };

    const findById = (id) => getProfiles().find((profile) => profile.id === id);

    const findByName = (name) => getProfiles().find((profile) => profile.name === name);

    const add = (input) => {
        const profile = model.createProfile(input, getProfiles());
        getProfiles().unshift(profile);
        notify();
        return profile;
    };

    const update = (id, input) => {
        const profile = findById(id);
        if (!profile) return null;

        model.updateProfile(profile, input);
        notify();
        return profile;
    };

    const replace = (profile) => {
        const profiles = getProfiles();
        const index = profiles.findIndex((item) => item.id === profile.id);
        if (index === -1) return null;

        profiles[index] = model.normalizeProfile(profile);
        notify();
        return profiles[index];
    };

    app.profileStore = {
        getProfiles,
        normalizeAll,
        findById,
        findByName,
        add,
        update,
        replace,
        notify,
        persist
    };

    window.HRProfileApp = app;
})();
