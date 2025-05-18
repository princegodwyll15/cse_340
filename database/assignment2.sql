INSERT INTO
    public.account(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES
(
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    )
UPDATE
    public.account
SET
    account_type = 'Admin'
WHERE
    account_firstname = 'Tony'
    and account_lastname = 'Stark';

DELETE FROM
    public.account
WHERE
    account_firstname = 'Tony'
    and account_lastname = 'Spark';

UPDATE
    public.inventory
SET
    inv_description = replace(
        inv_description,
        'small interiors',
        'huge interiors'
    )
WHERE
    inv_make = 'GM'
    and inv_model = 'Hummer';

SELECT
    inventory.inv_make,
    inventory.inv_model,
    classification.classification_name
FROM
    public.classification
    INNER JOIN inventory ON inventory.classification_id = classification.classification_id
WHERE
    classification.classification_name = 'Sport';

UPDATE
    public.inventory
SET
    inv_image = replace(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = replace(inv_thumbnail, '/images', '/images/vehicles');