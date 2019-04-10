from nbgrader.apps import NbGraderAPI
from pymongo import MongoClient

class Grader(object):
    def __init__(self):
        self.api = NbGraderAPI()
        self.client = MongoClient('mongodb://localhost:27017/')
        self.assignments = self.client.nnfl.assignments

    def update_grades(self, assignment_name):
        for assignment in self.assignments.find({"name": assignment_name}):
            for i, notebook in enumerate(assignment['notebooks']):
                notebook_id = '.'.join(notebook['name'].split('.')[:-1])
                print(notebook_id)
                graded_submissions = self.api.get_notebook_submissions(assignment_name, notebook_id)
                for j, submission in enumerate(notebook['submissions']):
                    score = [graded_submission['score'] for graded_submission in graded_submissions 
                                            if graded_submission['student'] == submission['username']][0]
                    print(score)
                    self.assignments.update({"_id": assignment['_id']},
                            {'$set': {"notebooks.{}.submissions.{}.score".format(i, j) : score}})
            self.assignments.update({"_id": assignment['_id']}, {'$set': {"isEvaluated" : True}})

    def assign(self, assignment_name):
        return self.api.assign(assignment_name, force=True, create=True)

    def autograde(self, assignment_name):
        for assignment in self.assignments.find({"name": assignment_name}):
            for username in assignment['whoSubmitted']:
                self.api.autograde(assignment_name, username, force=True, create=True)

    def grade(self, assignment_name):
        self.assign(assignment_name)
        self.autograde(assignment_name)
        self.update_grades(assignment_name)

grader = Grader()
grader.grade("ps1")