const n=`intro: Ανεβάστε το answers.json που δημιουργεί το notebook, με τα βάρη του εκπαιδευμένου SmallMNISTCNN. Η βαθμολόγηση επιτίθεται στο μοντέλο σας με PGD (ε = 0,3).
upload: Φόρτωση answers.json
loaded: Φορτώθηκε το «{name}»
noModel: Δεν έχει φορτωθεί ακόμη μοντέλο για αυτό το επίπεδο.
valid: SmallMNISTCNN, {n} παράμετροι
errJson: Το αρχείο δεν είναι έγκυρο JSON.
errLevel: Το αρχείο δεν περιέχει βάρη για το επίπεδο «{level}».
errWeights: Τα βάρη δεν ταιριάζουν στο SmallMNISTCNN (βρέθηκαν {found} τιμές αντί για {expected}).
running: Υπολογισμός προβλέψεων…
predsNote: Κάτω από κάθε «πειραγμένη» εικόνα φαίνεται η πρόβλεψη του μοντέλου σας.
correctCount: 'Σωστές προβλέψεις στις «πειραγμένες» εικόνες: {k} / {n} ({pct})'
trueLabel: 'σωστό: {d}'
page: Σελίδα
imagesTotal: '{count} εικόνες'
privateNote: Η βαθμολογία του ιδιωτικού συνόλου δεν εμφανίζεται εδώ· υπολογίζεται από τους διοργανωτές.
`;export{n as default};
