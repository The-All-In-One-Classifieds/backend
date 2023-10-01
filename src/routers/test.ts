import {Router} from "express";

export const router = Router();

router.get('/', (req, res) => {
    res.send({
        message: 'Got here',
        data: [
            {id: 1, result: 1},
        ],
    });
});