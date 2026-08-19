/**
 * @param  {...(string|number)} args 
 * @returns {string}
 */
function getColor(...args) {
    return "\u001b[" + args.join(";") + "m";
}

function AutoReplace(OriText, ...args) {
    let Index = 0;
    while (args.length != 0) {
        Index++;
        let thisArg = args.shift();
        if (thisArg != undefined) {
            OriText = OriText.replace(`{${Index}}`, thisArg);
        }
    }
    return OriText;
}

function logLogo() { // logo实在不会画，以后再画吧（Y-Bank）
    let LoaderVersion = ll.version();
    let VerInfoString = AutoReplace("LeviLamina-{1}.{2}.{3}{4}",
        LoaderVersion.major,
        LoaderVersion.minor,
        LoaderVersion.revision,
        (LoaderVersion.isBeta ? "Beta" : "")
    );

    logger.info(getColor(1, 33),
        String.raw`
            /————————/  / /\ \         /\——      /——  / / ----
           / /      /  / /  \ \       / /\ \    / /  / /--
          / /——————/  /_/____\ \     / /  \ \  / /  / /--
         / /      /  / /      \ \   / /    \ \/ /  / /  --
        /_/______/  / /        \ \ / /      \/ /  / /     ---
    `, `
      ${getColor(4, 33, 45)}===Highly customizable banking plugin===${getColor(0)}${getColor(1)}`, `
    ${getColor(4, 36, 45)}=====Running in ${VerInfoString} ${ll.scriptEngineVersion}=====${getColor(0)}${getColor(1)}`);
}