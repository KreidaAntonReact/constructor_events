const sourceJson = `{
    "event": {
        "title": "Ночь в музее",
        "date": "15 ноября, 18:30",
        "place": "Музей космонавтики, проспект Мира, 111",
        "description": "Вечерняя программа с выставкой и экскурсиями",
        "meeting": "Сбор: 18:30. Начало: 19:00."
    },
    "services": [
        { "id": "guide", "title": "  Экскурсия с гидом  ", "price": 500 },
        { "id": "audio", "title": "Аудиогид", "price": 350 },
        { "id": "catalog", "title": "Каталог выставки", "price": 250 }
    ]
}`;

const parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error(error);
        return null;
    }
}

const buildReport = (
    services = [],
    guideChecked = false,
    audioChecked = false,
    catalogChecked = false
) => {
    const mapSelectedServices = {
        guide: guideChecked,
        audio: audioChecked,
        catalog: catalogChecked
    }

    const filteredServices = services.filter(service => mapSelectedServices[service.id]);
    const transformedSelectedServices = filteredServices.map(service => {
        const { title, price } = service;
        return {
            title: title.trim(),
            price,
        }
    })
    const totalPrice = transformedSelectedServices.reduce((acc, service) => acc + service.price, 0)

    return {
        count: transformedSelectedServices.length,
        total: totalPrice,
        items: transformedSelectedServices,
    }
}

const findElementById = (id) => {
    try {
        const element = document.querySelector(`#${id}`);
        if (!element) {
            throw new Error(`[Element error found] ${id}`);
        }
        return element;
    } catch (error) {
        console.error(`[Element error found] ${id}`);
    }
}

const renderElementContent = (elementId, content) => {
    try {
        const element = findElementById(elementId);
        element.textContent = content;
    } catch (error) {
        console.error(`[Error render element content] ${elementId}`);
    }
}


const renderEventCard = (eventInfo) => {
    const { title, date, place, description, meeting } = eventInfo;

    renderElementContent('event-title', title);
    renderElementContent('event-date', date);
    renderElementContent('event-place', place);
    renderElementContent('event-description', description);
    renderElementContent('program', meeting);
}

const toggleProgram = () => {
    const program = findElementById("program");
    const isHidden = program.hasAttribute("hidden");

    program.toggleAttribute("hidden");

    return isHidden;
}

const handleClickShowButton = (event) => {
    const isHidden = toggleProgram();

    event.currentTarget.textContent = isHidden ? "Скрыть программу" : "Показать программу";
}

const handleSubmitForm = (event, data) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedServices = formData.getAll("services");

    const choiceError = findElementById('choice-error');
    const result = findElementById('result');
    const reportJson = findElementById('report-json');

    const isNoSelectedServices = selectedServices.length === 0;

    if (isNoSelectedServices) {
        choiceError.hidden = false;
        result.hidden = true;
        reportJson.hidden = true;
        return;
    }

    choiceError.hidden = true;

    const checkSelectedService = (serviceId) => selectedServices.includes(serviceId);

    const guideChecked = checkSelectedService('guide');
    const audioChecked = checkSelectedService('audio');
    const catalogChecked = checkSelectedService('catalog');

    const report = buildReport(
        data.services,
        guideChecked,
        audioChecked,
        catalogChecked
    );

    const titlesHtml = report.items
        .map((item) => item.title)
        .join('<br>');

    result.innerHTML =
        `Выбрано услуг: ${report.count}<br>` +
        `Итого: ${report.total} руб.<br>` +
        titlesHtml;

    const reportString = JSON.stringify(report);
    JSON.parse(reportString);
    reportJson.textContent = reportString;

    result.hidden = false;
    reportJson.hidden = false;
}

const runApp = () => {
    const data = parseJson(sourceJson);

    const dataError = findElementById('data-error');
    const serviceForm = findElementById('service-form');
    const eventCard = findElementById('event-card');

    if (!data) {
        dataError.hidden = false;
        serviceForm.hidden = true;
        eventCard.hidden = true;
        return;
    }

    dataError.hidden = true;
    serviceForm.hidden = false;
    eventCard.hidden = false;

    renderEventCard(data.event);

    const buttonShowProgram = findElementById('show-program');
    buttonShowProgram.addEventListener("click", handleClickShowButton);

    serviceForm.addEventListener("submit", (event) => handleSubmitForm(event, data));
}

runApp();
