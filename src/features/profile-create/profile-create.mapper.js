(function () {
    const app = window.HRProfileApp || {};
    const model = app.profileModel;

    const buildProfilePayload = ({
        name,
        classifier,
        department,
        okzCode,
        goals,
        competencies
    } = {}) => ({
        name: name || "",
        classifier: classifier || "",
        department: department || (model ? model.SYSTEM_DEFAULTS.department : ""),
        okzCode: okzCode || "",
        goals: Array.isArray(goals) ? goals : [],
        competenciesAreUserDefined: true,
        competencies: model ? model.normalizeCompetencies(competencies, {}, { useDefaults: false }) : competencies
    });

    app.profileCreate = {
        buildProfilePayload
    };

    window.HRProfileApp = app;
})();
