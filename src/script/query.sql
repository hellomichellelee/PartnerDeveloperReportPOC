ALTER TABLE dbo.responses


ADD CONSTRAINT FK_participant_id FOREIGN KEY (id) REFERENCES dbo.participants(id);


SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'responses'
ORDER BY ORDINAL_POSITION;

-- Step 1: Add the new column
ALTER TABLE dbo.responses
ADD participant_id int NULL;

-- Step 2: Populate it by matching on submission_id
UPDATE r
SET r.participant_id = p.id
FROM dbo.responses r
INNER JOIN dbo.participants p ON r.submission_id = p.submission_id;

-- Step 3: Now add the foreign key constraint
ALTER TABLE dbo.responses
ADD CONSTRAINT FK_responses_participants
FOREIGN KEY (participant_id)
REFERENCES dbo.participants(id);

SELECT* FROM dbo.responses;
