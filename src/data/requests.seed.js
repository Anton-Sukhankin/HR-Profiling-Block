const requests = [
    {
        "id": "REQ-8001",
        "profileId": 1,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2017.1",
                "newValue": "2017.2"
            }
        ]
    },
    {
        "id": "REQ-8002",
        "profileId": 1,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Отклонена",
        "changedAt": "11.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8003",
        "profileId": 1,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Одобрена",
        "changedAt": "12.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.1.11.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.1.11.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8004",
        "profileId": 1,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "На согласовании",
        "changedAt": "13.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8005",
        "profileId": 2,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8006",
        "profileId": 2,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Одобрена",
        "changedAt": "12.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.12.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.12.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8007",
        "profileId": 2,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "На согласовании",
        "changedAt": "14.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8008",
        "profileId": 2,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2034.1",
                "newValue": "2034.2"
            }
        ]
    },
    {
        "id": "REQ-8009",
        "profileId": 2,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Черновик",
        "changedAt": "18.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8010",
        "profileId": 3,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.13.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.13.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8011",
        "profileId": 3,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "На согласовании",
        "changedAt": "13.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8012",
        "profileId": 3,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2051.1",
                "newValue": "2051.2"
            }
        ]
    },
    {
        "id": "REQ-8013",
        "profileId": 3,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Черновик",
        "changedAt": "19.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8014",
        "profileId": 3,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Отклонена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.13.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.13.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8015",
        "profileId": 3,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Одобрена",
        "changedAt": "25.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8016",
        "profileId": 4,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8017",
        "profileId": 4,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "В работе",
        "changedAt": "14.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2068.1",
                "newValue": "2068.2"
            }
        ]
    },
    {
        "id": "REQ-8018",
        "profileId": 4,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Черновик",
        "changedAt": "18.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8019",
        "profileId": 4,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Отклонена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.4.14.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.4.14.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8020",
        "profileId": 4,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Одобрена",
        "changedAt": "26.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8021",
        "profileId": 4,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "На согласовании",
        "changedAt": "12.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2068.1",
                "newValue": "2068.2"
            }
        ]
    },
    {
        "id": "REQ-8022",
        "profileId": 4,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8023",
        "profileId": 5,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2085.1",
                "newValue": "2085.2"
            }
        ]
    },
    {
        "id": "REQ-8024",
        "profileId": 5,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "Черновик",
        "changedAt": "15.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8025",
        "profileId": 5,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "Отклонена",
        "changedAt": "20.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.5.15.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.5.15.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8026",
        "profileId": 5,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "Одобрена",
        "changedAt": "25.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8027",
        "profileId": 5,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "На согласовании",
        "changedAt": "12.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2085.1",
                "newValue": "2085.2"
            }
        ]
    },
    {
        "id": "REQ-8028",
        "profileId": 5,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "В работе",
        "changedAt": "17.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8029",
        "profileId": 5,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.5.15.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.5.15.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8030",
        "profileId": 5,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Отклонена",
        "changedAt": "27.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8031",
        "profileId": 6,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8032",
        "profileId": 6,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "Отклонена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.6.16.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.6.16.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8033",
        "profileId": 6,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "Одобрена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8034",
        "profileId": 6,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2102.1",
                "newValue": "2102.2"
            }
        ]
    },
    {
        "id": "REQ-8035",
        "profileId": 6,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8036",
        "profileId": 6,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.6.16.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.6.16.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8037",
        "profileId": 6,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8038",
        "profileId": 6,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Одобрена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2102.1",
                "newValue": "2102.2"
            }
        ]
    },
    {
        "id": "REQ-8039",
        "profileId": 6,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "На согласовании",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8040",
        "profileId": 7,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.7.17.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.7.17.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8041",
        "profileId": 7,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Одобрена",
        "changedAt": "17.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8042",
        "profileId": 7,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "На согласовании",
        "changedAt": "24.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2119.1",
                "newValue": "2119.2"
            }
        ]
    },
    {
        "id": "REQ-8043",
        "profileId": 8,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8044",
        "profileId": 8,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "На согласовании",
        "changedAt": "18.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2136.1",
                "newValue": "2136.2"
            }
        ]
    },
    {
        "id": "REQ-8045",
        "profileId": 8,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "В работе",
        "changedAt": "26.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8046",
        "profileId": 8,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Черновик",
        "changedAt": "16.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.8.18.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.8.18.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8047",
        "profileId": 9,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2153.1",
                "newValue": "2153.2"
            }
        ]
    },
    {
        "id": "REQ-8048",
        "profileId": 9,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "В работе",
        "changedAt": "19.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8049",
        "profileId": 9,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.19.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.19.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8050",
        "profileId": 9,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Отклонена",
        "changedAt": "19.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8051",
        "profileId": 9,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2153.1",
                "newValue": "2153.2"
            }
        ]
    },
    {
        "id": "REQ-8052",
        "profileId": 10,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8053",
        "profileId": 10,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Черновик",
        "changedAt": "20.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.1.20.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.1.20.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8054",
        "profileId": 10,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Отклонена",
        "changedAt": "12.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8055",
        "profileId": 10,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Одобрена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2170.1",
                "newValue": "2170.2"
            }
        ]
    },
    {
        "id": "REQ-8056",
        "profileId": 10,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "На согласовании",
        "changedAt": "14.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8057",
        "profileId": 10,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "В работе",
        "changedAt": "24.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.1.20.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.1.20.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8058",
        "profileId": 11,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.21.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.21.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8059",
        "profileId": 11,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Отклонена",
        "changedAt": "21.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8060",
        "profileId": 11,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Одобрена",
        "changedAt": "14.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2187.1",
                "newValue": "2187.2"
            }
        ]
    },
    {
        "id": "REQ-8061",
        "profileId": 11,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "На согласовании",
        "changedAt": "25.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8062",
        "profileId": 11,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "В работе",
        "changedAt": "18.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.21.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.21.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8063",
        "profileId": 11,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Черновик",
        "changedAt": "11.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8064",
        "profileId": 11,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Отклонена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2187.1",
                "newValue": "2187.2"
            }
        ]
    },
    {
        "id": "REQ-8065",
        "profileId": 12,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8066",
        "profileId": 12,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Одобрена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2204.1",
                "newValue": "2204.2"
            }
        ]
    },
    {
        "id": "REQ-8067",
        "profileId": 12,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "На согласовании",
        "changedAt": "16.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8068",
        "profileId": 12,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.22.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.22.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8069",
        "profileId": 12,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8070",
        "profileId": 12,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Отклонена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2204.1",
                "newValue": "2204.2"
            }
        ]
    },
    {
        "id": "REQ-8071",
        "profileId": 12,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8072",
        "profileId": 12,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "На согласовании",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.22.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.22.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8073",
        "profileId": 13,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2221.1",
                "newValue": "2221.2"
            }
        ]
    },
    {
        "id": "REQ-8074",
        "profileId": 13,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "На согласовании",
        "changedAt": "23.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8075",
        "profileId": 13,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "В работе",
        "changedAt": "18.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.4.23.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.4.23.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8076",
        "profileId": 13,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Черновик",
        "changedAt": "13.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8077",
        "profileId": 13,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Отклонена",
        "changedAt": "26.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2221.1",
                "newValue": "2221.2"
            }
        ]
    },
    {
        "id": "REQ-8078",
        "profileId": 13,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Одобрена",
        "changedAt": "21.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8079",
        "profileId": 13,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "На согласовании",
        "changedAt": "16.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.4.23.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.4.23.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8080",
        "profileId": 13,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "В работе",
        "changedAt": "11.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8081",
        "profileId": 13,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Черновик",
        "changedAt": "24.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2221.1",
                "newValue": "2221.2"
            }
        ]
    },
    {
        "id": "REQ-8082",
        "profileId": 14,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8083",
        "profileId": 14,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "В работе",
        "changedAt": "24.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.5.24.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.5.24.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8084",
        "profileId": 14,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "Черновик",
        "changedAt": "20.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8085",
        "profileId": 15,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.6.25.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.6.25.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8086",
        "profileId": 15,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Черновик",
        "changedAt": "25.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8087",
        "profileId": 15,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "Отклонена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2255.1",
                "newValue": "2255.2"
            }
        ]
    },
    {
        "id": "REQ-8088",
        "profileId": 15,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "Одобрена",
        "changedAt": "19.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8089",
        "profileId": 16,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8090",
        "profileId": 16,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Отклонена",
        "changedAt": "26.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2272.1",
                "newValue": "2272.2"
            }
        ]
    },
    {
        "id": "REQ-8091",
        "profileId": 16,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Одобрена",
        "changedAt": "24.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8092",
        "profileId": 16,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "На согласовании",
        "changedAt": "22.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.7.26.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.7.26.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8093",
        "profileId": 16,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "В работе",
        "changedAt": "20.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8094",
        "profileId": 17,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2289.1",
                "newValue": "2289.2"
            }
        ]
    },
    {
        "id": "REQ-8095",
        "profileId": 17,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Одобрена",
        "changedAt": "27.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8096",
        "profileId": 17,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "На согласовании",
        "changedAt": "26.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.8.27.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.8.27.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8097",
        "profileId": 17,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "В работе",
        "changedAt": "25.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8098",
        "profileId": 17,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Черновик",
        "changedAt": "24.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2289.1",
                "newValue": "2289.2"
            }
        ]
    },
    {
        "id": "REQ-8099",
        "profileId": 17,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Отклонена",
        "changedAt": "23.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8100",
        "profileId": 18,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8101",
        "profileId": 18,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.28.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.28.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8102",
        "profileId": 18,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8103",
        "profileId": 18,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2306.1",
                "newValue": "2306.2"
            }
        ]
    },
    {
        "id": "REQ-8104",
        "profileId": 18,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8105",
        "profileId": 18,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.28.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.28.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8106",
        "profileId": 18,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8107",
        "profileId": 19,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.1.29.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.1.29.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8108",
        "profileId": 19,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "В работе",
        "changedAt": "11.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8109",
        "profileId": 19,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Черновик",
        "changedAt": "12.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2323.1",
                "newValue": "2323.2"
            }
        ]
    },
    {
        "id": "REQ-8110",
        "profileId": 19,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Отклонена",
        "changedAt": "13.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8111",
        "profileId": 19,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Одобрена",
        "changedAt": "14.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.1.29.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.1.29.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8112",
        "profileId": 19,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "На согласовании",
        "changedAt": "15.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8113",
        "profileId": 19,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2323.1",
                "newValue": "2323.2"
            }
        ]
    },
    {
        "id": "REQ-8114",
        "profileId": 19,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Черновик",
        "changedAt": "17.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8115",
        "profileId": 20,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8116",
        "profileId": 20,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Черновик",
        "changedAt": "12.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2340.1",
                "newValue": "2340.2"
            }
        ]
    },
    {
        "id": "REQ-8117",
        "profileId": 20,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Отклонена",
        "changedAt": "14.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8118",
        "profileId": 20,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Одобрена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.30.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.30.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8119",
        "profileId": 20,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "На согласовании",
        "changedAt": "18.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8120",
        "profileId": 20,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "В работе",
        "changedAt": "20.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2340.1",
                "newValue": "2340.2"
            }
        ]
    },
    {
        "id": "REQ-8121",
        "profileId": 20,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8122",
        "profileId": 20,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Отклонена",
        "changedAt": "24.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.30.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.30.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8123",
        "profileId": 20,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Одобрена",
        "changedAt": "26.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8124",
        "profileId": 21,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2357.1",
                "newValue": "2357.2"
            }
        ]
    },
    {
        "id": "REQ-8125",
        "profileId": 21,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "Отклонена",
        "changedAt": "13.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8126",
        "profileId": 21,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Одобрена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.31.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.31.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8127",
        "profileId": 22,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8128",
        "profileId": 22,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "Одобрена",
        "changedAt": "14.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.4.32.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.4.32.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8129",
        "profileId": 22,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "На согласовании",
        "changedAt": "18.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8130",
        "profileId": 22,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "В работе",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2374.1",
                "newValue": "2374.2"
            }
        ]
    },
    {
        "id": "REQ-8131",
        "profileId": 23,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.5.33.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.5.33.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8132",
        "profileId": 23,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "На согласовании",
        "changedAt": "15.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8133",
        "profileId": 23,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "В работе",
        "changedAt": "20.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2391.1",
                "newValue": "2391.2"
            }
        ]
    },
    {
        "id": "REQ-8134",
        "profileId": 23,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "Черновик",
        "changedAt": "25.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8135",
        "profileId": 23,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "Отклонена",
        "changedAt": "12.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.5.33.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.5.33.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8136",
        "profileId": 24,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8137",
        "profileId": 24,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "В работе",
        "changedAt": "16.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2408.1",
                "newValue": "2408.2"
            }
        ]
    },
    {
        "id": "REQ-8138",
        "profileId": 24,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8139",
        "profileId": 24,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.6.34.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.6.34.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8140",
        "profileId": 24,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "Одобрена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8141",
        "profileId": 24,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "На согласовании",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2408.1",
                "newValue": "2408.2"
            }
        ]
    },
    {
        "id": "REQ-8142",
        "profileId": 25,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2425.1",
                "newValue": "2425.2"
            }
        ]
    },
    {
        "id": "REQ-8143",
        "profileId": 25,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Черновик",
        "changedAt": "17.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8144",
        "profileId": 25,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Отклонена",
        "changedAt": "24.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.7.35.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.7.35.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8145",
        "profileId": 25,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Одобрена",
        "changedAt": "13.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8146",
        "profileId": 25,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "На согласовании",
        "changedAt": "20.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2425.1",
                "newValue": "2425.2"
            }
        ]
    },
    {
        "id": "REQ-8147",
        "profileId": 25,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "В работе",
        "changedAt": "27.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8148",
        "profileId": 25,
        "initiatorName": "Степанова Людмила Михайловна",
        "initiatorPosition": "Главный бухгалтер",
        "status": "Черновик",
        "changedAt": "16.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.7.35.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.7.35.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8149",
        "profileId": 26,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8150",
        "profileId": 26,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "Отклонена",
        "changedAt": "18.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.8.36.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.8.36.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8151",
        "profileId": 26,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Одобрена",
        "changedAt": "26.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8152",
        "profileId": 26,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "На согласовании",
        "changedAt": "16.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2442.1",
                "newValue": "2442.2"
            }
        ]
    },
    {
        "id": "REQ-8153",
        "profileId": 26,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "В работе",
        "changedAt": "24.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8154",
        "profileId": 26,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "Черновик",
        "changedAt": "14.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.8.36.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.8.36.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8155",
        "profileId": 26,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "Отклонена",
        "changedAt": "22.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8156",
        "profileId": 26,
        "initiatorName": "Борисов Константин Эдуардович",
        "initiatorPosition": "Генеральный директор",
        "status": "Одобрена",
        "changedAt": "12.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2442.1",
                "newValue": "2442.2"
            }
        ]
    },
    {
        "id": "REQ-8157",
        "profileId": 27,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "Отклонена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8158",
        "profileId": 27,
        "initiatorName": "Соколова Анна Игоревна",
        "initiatorPosition": "HR Директор",
        "status": "Одобрена",
        "changedAt": "19.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8159",
        "profileId": 27,
        "initiatorName": "Попова Мария Сергеевна",
        "initiatorPosition": "Руководитель отдела",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Кузнецов Дмитрий Михайлович",
        "currentApproverPosition": "Вице-президент по технологиям",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2459.1",
                "newValue": "2459.2"
            }
        ]
    },
    {
        "id": "REQ-8160",
        "profileId": 27,
        "initiatorName": "Сидоров Петр Алексеевич",
        "initiatorPosition": "Ведущий менеджер проектов",
        "status": "В работе",
        "changedAt": "19.05.2026",
        "currentApproverName": "Соколова Анна Игоревна",
        "currentApproverPosition": "HR Директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8161",
        "profileId": 27,
        "initiatorName": "Макаров Денис Ильич",
        "initiatorPosition": "CPO",
        "status": "Черновик",
        "changedAt": "10.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8162",
        "profileId": 27,
        "initiatorName": "Егорова Татьяна Владимировна",
        "initiatorPosition": "Руководитель QA",
        "status": "Отклонена",
        "changedAt": "19.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8163",
        "profileId": 27,
        "initiatorName": "Козлов Дмитрий Александрович",
        "initiatorPosition": "Арт-директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2459.1",
                "newValue": "2459.2"
            }
        ]
    },
    {
        "id": "REQ-8164",
        "profileId": 27,
        "initiatorName": "Киселев Роман Олегович",
        "initiatorPosition": "Руководитель отдела Охраны труда",
        "status": "На согласовании",
        "changedAt": "19.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8165",
        "profileId": 27,
        "initiatorName": "Козлов Семен Игоревич",
        "initiatorPosition": "Руководитель портфеля проектов",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.0.37.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8166",
        "profileId": 28,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 3",
                "newValue": "Band 4"
            }
        ]
    },
    {
        "id": "REQ-8167",
        "profileId": 28,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "На согласовании",
        "changedAt": "20.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2476.1",
                "newValue": "2476.2"
            }
        ]
    },
    {
        "id": "REQ-8168",
        "profileId": 28,
        "initiatorName": "Тихонов Игорь Борисович",
        "initiatorPosition": "Главный юрисконсульт",
        "status": "В работе",
        "changedAt": "12.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8169",
        "profileId": 29,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "На согласовании",
        "changedAt": "10.05.2026",
        "currentApproverName": "Александрова Ольга Петровна",
        "currentApproverPosition": "Директор по организационному развитию",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2493.1",
                "newValue": "2493.2"
            }
        ]
    },
    {
        "id": "REQ-8170",
        "profileId": 29,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "В работе",
        "changedAt": "21.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8171",
        "profileId": 29,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "Черновик",
        "changedAt": "14.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.2.39.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.2.39.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8172",
        "profileId": 29,
        "initiatorName": "Петров Василий Алибабаевич",
        "initiatorPosition": "Начальник отдела инфраструктуры",
        "status": "Отклонена",
        "changedAt": "25.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 4",
                "newValue": "Band 5"
            }
        ]
    },
    {
        "id": "REQ-8173",
        "profileId": 30,
        "initiatorName": "Морозова Елена Викторовна",
        "initiatorPosition": "Финансовый директор",
        "status": "В работе",
        "changedAt": "10.05.2026",
        "currentApproverName": "Борисов Константин Эдуардович",
        "currentApproverPosition": "Генеральный директор",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    },
    {
        "id": "REQ-8174",
        "profileId": 30,
        "initiatorName": "Лебедев Максим Юрьевич",
        "initiatorPosition": "CISO",
        "status": "Черновик",
        "changedAt": "22.05.2026",
        "currentApproverName": null,
        "currentApproverPosition": null,
        "changes": [
            {
                "field": "classifier",
                "oldValue": "A.B.3.40.0120.3A.H.C.X.X.X.X.1",
                "newValue": "A.B.3.40.0120.3A.H.C.X.X.X.X.2"
            }
        ]
    },
    {
        "id": "REQ-8175",
        "profileId": 30,
        "initiatorName": "Смирнов Алексей Петрович",
        "initiatorPosition": "Технический директор",
        "status": "Отклонена",
        "changedAt": "16.05.2026",
        "currentApproverName": "Иванов Иван Иванович",
        "currentApproverPosition": "Директор департамента",
        "changes": [
            {
                "field": "band",
                "oldValue": "Band 2",
                "newValue": "Band 3"
            }
        ]
    },
    {
        "id": "REQ-8176",
        "profileId": 30,
        "initiatorName": "Кузнецова Ирина Павловна",
        "initiatorPosition": "Руководитель отдела СА",
        "status": "Одобрена",
        "changedAt": "10.05.2026",
        "currentApproverName": "Смирнов Алексей Петрович",
        "currentApproverPosition": "Технический директор",
        "changes": [
            {
                "field": "okzCode",
                "oldValue": "2510.1",
                "newValue": "2510.2"
            }
        ]
    },
    {
        "id": "REQ-8177",
        "profileId": 30,
        "initiatorName": "Новиков Павел Сергеевич",
        "initiatorPosition": "Коммерческий директор",
        "status": "На согласовании",
        "changedAt": "22.05.2026",
        "currentApproverName": "Макаров Денис Ильич",
        "currentApproverPosition": "CPO",
        "changes": [
            {
                "field": "isTypicalProfile",
                "oldValue": "false",
                "newValue": "true"
            }
        ]
    }
];

window.requests = requests;
