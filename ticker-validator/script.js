let tickers = stocks.map(stock => stock[1]);

$("#table").hide();
$("#tickerValidate").focus();

$("#tickerValidate").on("input", () => {
    if (tickers.includes($("#tickerValidate").val().toUpperCase().trim())) {
        $("#messageText").removeClass("text-error").removeClass("text-success").addClass("text-success").removeClass("mt-6").text("Current ticker is a valid ticker");
        const currentStock = stocks.find(stock => stock[1] == $("#tickerValidate").val().toUpperCase().trim());
        $("#companyName").text(currentStock[0]);
        $("#ticker").text(currentStock[1]);
        $("#exchange").text(currentStock[2]);
        $("#sector").text(currentStock[3]);
        $("#industryGroup").text(currentStock[4]);
        $("#industry").text(currentStock[5]);
        $("#subIndustry").text(currentStock[6])
        $("#table").show();
    } else {
        $("#messageText").removeClass("text-error").removeClass("text-success").addClass("text-error").removeClass("mt-6").addClass("mt-6").text("Current ticker is not a valid ticker");
        $("#table").hide();
    }
})