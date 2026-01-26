# Quickstart: Dhammapada & Pali Support

## Generatating the Dhammapada

To generate the Dhammapada in Pali:

```bash
# Generate Chapter 1
npm run start -- chapter generate -b dhammapada -c 1 --template dhammapada-pali

# The output JSON will be in exports/dhammapada/Chapter-01.json
```

## Importing Pali Content

```bash
npm run start -- translations import exports/dhammapada/Chapter-01.json
```

## Translating Pali Verses

To translate the imported Pali verses to English:

```bash
# Translate Chapter 1, Verse 1 from Pali to English
npm run start -- verse translate -b dhammapada -c 1 -v 1 --to en --from pali --provider ai-sdk
```

## Exporting

```bash
# Export in Pali format
npm run start -- book export -b dhammapada --format pali-scripture
```

---- 


 1 # Example commands now supported:
   2 npm run start -- db seed
   3 npm run start -- chapter generate -b dhammapada -c 1 --template dhammapada-pali
   4 npm run start -- verse translate -b dhammapada -c 1 -v 1 --to en --from pali --provider ai-sdk
   5 npm run start -- book export dhammapada --format pali-scripture